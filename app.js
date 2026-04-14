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
        const showModal = ref(false);
        const activeNode = ref(null);
        
        // Selections for the modal
        const selectedPedigreeIdx = reactive({});
        const selectedSecondaryIdx = reactive({});

        // Our Initial Target in the Tree
        const treeRoot = ref({
            name: 'DarkDrium',
            kind: 'monster',
            family: 'Boss',
            pedigree: null,
            secondary: null
        });

        const loadData = async () => {
            try {
                const response = await fetch('dwm_breeding.yml');
                const yamlText = await response.text();
                const parsed = jsyaml.load(yamlText);
                
                monsterData.value = parsed.monsters;
                
                // Initialize the tree root with data if missing
                if (monsterData.value['DarkDrium']) {
                     treeRoot.value.family = monsterData.value['DarkDrium'].family;
                }
                
                loading.value = false;
            } catch (err) {
                console.error("Error loading YAML:", err);
                alert("Failed to load dwm_breeding.yml! Ensure you are running via a local web server (e.g. python -m http.server)");
            }
        };

        const handleExpandRequest = (node) => {
            activeNode.value = node;
            
            // Reset local dropdown selections for this modal
            const data = monsterData.value[node.name];
            if (data && data.recipe_groups) {
                data.recipe_groups.forEach(g => {
                    selectedPedigreeIdx[g.group_id] = 0;
                    selectedSecondaryIdx[g.group_id] = 0;
                });
            }
            
            showModal.value = true;
        };

        const lockInRecipe = (group) => {
            const pIdx = selectedPedigreeIdx[group.group_id] || 0;
            const sIdx = selectedSecondaryIdx[group.group_id] || 0;
            
            const pOption = group.pedigree_options[pIdx];
            const sOption = group.secondary_options[sIdx];
            
            // We mutate activeNode to have pedigree and secondary
            // Create deep copies to avoid referencing the exact same object in the tree twice
            // and we set their family if they are 'monster'
            
            const createNode = (opt) => {
                let family = '';
                if (opt.kind === 'monster' && monsterData.value[opt.name]) {
                    family = monsterData.value[opt.name].family;
                } else if (opt.kind === 'token') {
                    family = 'Unknown';
                }
                
                return {
                    name: opt.name,
                    kind: opt.kind,
                    min_plus: opt.min_plus,
                    family: family,
                    pedigree: null,
                    secondary: null
                };
            };

            activeNode.value.pedigree = createNode(pOption);
            activeNode.value.secondary = createNode(sOption);
            
            showModal.value = false;
            activeNode.value = null;
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
            activeNode,
            selectedPedigreeIdx,
            selectedSecondaryIdx,
            handleExpandRequest,
            lockInRecipe
        };
    }
}).mount('#app');
