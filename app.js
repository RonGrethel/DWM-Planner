const { createApp, ref, onMounted, reactive } = Vue;

const STAT_KEYS = ['HP', 'MP', 'ATK', 'DEF', 'AGI', 'INT'];

// The UI component for the tree node
const TreeNode = {
    name: 'tree-node',
    template: '#tree-node-template',
    props: ['node'],
    computed: {
        isExpandable() {
            return this.$root.monsterData[this.node.name]?.has_specific_recipe;
        }
    },
    methods: {
        requestExpand() {
            this.$emit('request-expand', this.node);
        },
        openDetails() {
            this.$emit('open-details', this.node);
        }
    }
};

createApp({
    components: {
        'tree-node': TreeNode
    },
    setup() {
        const loading = ref(true);
        const monsterData = ref({});
        
        // Modal state
        const showModal = ref(false);
        const modalType = ref(''); // 'recipe', 'token', or 'details'
        const activeNode = ref(null);
        
        // Selections for recipe modal
        const selectedPedigreeIdx = reactive({});
        const selectedSecondaryIdx = reactive({});
        
        // Selections for token modal
        const tokenCandidates = ref([]);
        const selectedTokenReplacement = ref(null);

        const buildDefaultStats = () => ({ HP: 10, MP: 10, ATK: 10, DEF: 10, AGI: 10, INT: 10 });

        const treeRoot = ref({
            name: 'DarkDrium',
            kind: 'monster',
            family: 'Boss',
            userLevel: 99,
            userPlus: 0,
            userStats: buildDefaultStats(),
            pedigree: null,
            secondary: null
        });

        const loadData = async () => {
            try {
                const response = await fetch('dwm_breeding.yml');
                const yamlText = await response.text();
                const parsed = jsyaml.load(yamlText);
                
                monsterData.value = parsed.monsters;
                if (monsterData.value['DarkDrium']) {
                     treeRoot.value.family = monsterData.value['DarkDrium'].family;
                }
                loading.value = false;
            } catch (err) {
                console.error("Error loading YAML:", err);
                alert("Failed to load dwm_breeding.yml");
            }
        };

        const handleExpandRequest = (node) => {
            activeNode.value = node;
            if (node.kind === 'token') {
                modalType.value = 'token';
                const familyName = node.name;
                const candidates = Object.keys(monsterData.value)
                    .filter(k => monsterData.value[k].family && monsterData.value[k].family.toUpperCase() === familyName.toUpperCase());
                tokenCandidates.value = candidates.sort();
                selectedTokenReplacement.value = null;
                showModal.value = true;
            } else {
                modalType.value = 'recipe';
                const data = monsterData.value[node.name];
                if (data && data.recipe_groups) {
                    data.recipe_groups.forEach(g => {
                        selectedPedigreeIdx[g.group_id] = 0;
                        selectedSecondaryIdx[g.group_id] = 0;
                    });
                }
                showModal.value = true;
            }
        };

        const handleOpenDetails = (node) => {
            activeNode.value = node;
            modalType.value = 'details';
            showModal.value = true;
        };

        const lockInRecipe = (group) => {
            const pIdx = selectedPedigreeIdx[group.group_id] || 0;
            const sIdx = selectedSecondaryIdx[group.group_id] || 0;
            
            const pOption = group.pedigree_options[pIdx];
            const sOption = group.secondary_options[sIdx];
            
            const createNode = (opt, existingChild) => {
                // Feature: PRESERVE subtree if the monster name doesn't change
                if (existingChild && existingChild.name === opt.name) {
                    return existingChild;
                }

                let family = '';
                if (opt.kind === 'monster' && monsterData.value[opt.name]) {
                    family = monsterData.value[opt.name].family;
                } else if (opt.kind === 'token') {
                    family = opt.name;
                }
                
                return {
                    name: opt.name,
                    kind: opt.kind,
                    min_plus: opt.min_plus,
                    family: family,
                    userLevel: 10,
                    userPlus: 0,
                    userStats: buildDefaultStats(),
                    pedigree: null,
                    secondary: null
                };
            };

            activeNode.value.pedigree = createNode(pOption, activeNode.value.pedigree);
            activeNode.value.secondary = createNode(sOption, activeNode.value.secondary);
            
            showModal.value = false;
            activeNode.value = null;
        };

        const lockInToken = () => {
            if (!selectedTokenReplacement.value) return;
            const targetName = selectedTokenReplacement.value;
            const mData = monsterData.value[targetName];
            
            activeNode.value.name = targetName;
            activeNode.value.kind = 'monster';
            activeNode.value.family = mData.family;
            
            showModal.value = false;
            activeNode.value = null;
        };

        const clearChildren = () => {
             if (activeNode.value) {
                 activeNode.value.pedigree = null;
                 activeNode.value.secondary = null;
                 showModal.value = false;
                 activeNode.value = null;
             }
        };

        const computePlus = (node) => {
            if (node.pedigree && node.secondary) {
                const pPlus = computePlus(node.pedigree);
                const sPlus = computePlus(node.secondary);
                const base = Math.max(pPlus, sPlus);
                
                const pLevel = node.pedigree.userLevel || 10;
                const sLevel = node.secondary.userLevel || 10;
                const totalLevels = pLevel + sLevel;
                
                let bonus = 0;
                if (totalLevels >= 100) bonus = 5;
                else if (totalLevels >= 80) bonus = 4;
                else if (totalLevels >= 60) bonus = 3;
                else if (totalLevels >= 40) bonus = 2;
                else if (totalLevels >= 20) bonus = 1;
                
                return Math.min(base + bonus, 99); // Clamp to 99!
            }
            return Math.min(node.userPlus || 0, 99);
        };

        const getStartStats = (node) => {
            const stats = { HP: 0, MP: 0, ATK: 0, DEF: 0, AGI: 0, INT: 0 };
            if (node.pedigree && node.secondary) {
                for(let key of STAT_KEYS) {
                    const pVal = node.pedigree.userStats[key] || 0;
                    const sVal = node.secondary.userStats[key] || 0;
                    stats[key] = Math.floor((pVal + sVal) / 4);
                }
            }
            return stats;
        };

        const getSpritePath = (name) => {
            const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
            return `assets/sprites/${cleanName}.png`;
        };

        onMounted(() => {
            loadData();
        });

        return {
            loading,
            monsterData,
            STAT_KEYS,
            treeRoot,
            showModal,
            modalType,
            activeNode,
            selectedPedigreeIdx,
            selectedSecondaryIdx,
            tokenCandidates,
            selectedTokenReplacement,
            handleExpandRequest,
            handleOpenDetails,
            lockInRecipe,
            lockInToken,
            clearChildren,
            computePlus,
            getStartStats,
            getSpritePath
        };
    }
}).mount('#app');
