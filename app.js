const { createApp, ref, onMounted, reactive } = Vue;

// The UI component for the tree node
const TreeNode = {
    name: 'tree-node',
    template: '#tree-node-template',
    props: ['node'],
    computed: {
        isExpandable() {
            // It is expandable if we have data for it and it has specific recipes
            return this.$root.monsterData[this.node.name]?.has_specific_recipe;
        }
    },
    methods: {
        requestExpand() {
            this.$emit('request-expand', this.node);
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
        const modalType = ref(''); // 'recipe' or 'token'
        const activeNode = ref(null);
        
        // Selections for recipe modal
        const selectedPedigreeIdx = reactive({});
        const selectedSecondaryIdx = reactive({});
        
        // Selections for token modal
        const tokenCandidates = ref([]);
        const selectedTokenReplacement = ref(null);

        // Our Initial Target in the Tree
        const treeRoot = ref({
            name: 'DarkDrium',
            kind: 'monster',
            family: 'Boss',
            userLevel: 10,
            userPlus: 0,
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
                // Find all monsters of this family
                const familyName = node.name; // e.g. 'SLIME'
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

        const lockInRecipe = (group) => {
            const pIdx = selectedPedigreeIdx[group.group_id] || 0;
            const sIdx = selectedSecondaryIdx[group.group_id] || 0;
            
            const pOption = group.pedigree_options[pIdx];
            const sOption = group.secondary_options[sIdx];
            
            const createNode = (opt) => {
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
                    pedigree: null,
                    secondary: null
                };
            };

            activeNode.value.pedigree = createNode(pOption);
            activeNode.value.secondary = createNode(sOption);
            
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

        const clearChildren = (node) => {
            node.pedigree = null;
            node.secondary = null;
        };

        // Recursive + computation
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
                
                return base + bonus;
            }
            return node.userPlus || 0;
        };

        // Initialize state
        onMounted(() => {
            loadData();
        });

        return {
            loading,
            monsterData,
            treeRoot,
            showModal,
            modalType,
            activeNode,
            selectedPedigreeIdx,
            selectedSecondaryIdx,
            tokenCandidates,
            selectedTokenReplacement,
            handleExpandRequest,
            lockInRecipe,
            lockInToken,
            clearChildren,
            computePlus
        };
    }
}).mount('#app');
