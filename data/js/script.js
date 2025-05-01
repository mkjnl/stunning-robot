class ColumnAnimation {
    constructor(column, speed, index, hackSystem) {
        this.column = column;
        this.hackSystem = hackSystem;
        this.wrapper = column.querySelector('.char-wrapper');
        this.clone = this.wrapper.cloneNode(true);
        this.column.appendChild(this.clone);
        this.speed = speed * 40;
        this.position = 0;
        this.animationId = null;
        this.isPaused = false;
        this.index = index;
        this.start();
    }

    start() {
        const animate = () => {
            if (this.isPaused || this.hackSystem.gameEnded) return;

            this.position += this.speed * (16.6 / 1000);
            const wrapperHeight = this.wrapper.offsetHeight;

            if (this.position >= wrapperHeight) {
                this.position -= wrapperHeight;
            }

            this.wrapper.style.top = `-${this.position}px`;
            this.clone.style.top = `${wrapperHeight - this.position}px`;

            this.animationId = requestAnimationFrame(animate);
        };
        this.animationId = requestAnimationFrame(animate);
    }

    checkPosition() {
        const center = document.getElementById('centerLine').getBoundingClientRect();
        const wrappers = [this.wrapper, this.clone];
        let isValid = false;

        wrappers.forEach(wrap => {
            const chars = wrap.querySelectorAll('.char.highlight');
            chars.forEach(char => {
                const rect = char.getBoundingClientRect();
                const charCenter = rect.top + (rect.height * 0.5);
                const centerTop = center.top + (center.height * 0.3);
                const centerBottom = center.bottom - (center.height * 0.3);

                if (charCenter > centerTop && charCenter < centerBottom) {
                    isValid = true;
                }
            });
        });

        return isValid;
    }

    pause() { this.isPaused = true; }
    resume() {
        if (!this.hackSystem.gameEnded) {
            this.isPaused = false;
            this.start();
        }
    }
    stop() {
        cancelAnimationFrame(this.animationId);
        this.isPaused = true;
    }
}

class LootGenerator {
    constructor() {
        this.lootPool = [
            // epic 品质（红色，顶级）
            { name: "99A装甲连", quality: "epic", size: { width: 4, height: 4 }, glowColor: "#ff3333", probability: 1, description: "隐藏款99A装甲连！指挥它们横扫亚洲吧！！！" },
            { name: "安德斯轻型坦克", quality: "epic", size: { width: 4, height: 4 }, glowColor: "#ff3333", probability: 8, description: "配备 RUAG 滑膛炮 120 毫米的 ANDERS 轻型远征坦克" },
            { name: "ABramsX主战坦克", quality: "epic", size: { width: 4, height: 4 }, glowColor: "#ff3333", probability: 9, description: "艾布拉姆斯X是一款创新的主战坦克（MBT）技术演示器，由通用动力陆地系统公司（GDLS）于2022年9月在华盛顿特区举行的美国陆军协会（AUSA）国防展上首次展出" },
            { name: "99A主战坦克", quality: "epic", size: { width: 3, height: 3 }, glowColor: "#ff3333", probability: 4, description: "99A 型也称为 99A2 型或 ZTZ-99A 主战坦克（主战坦克），是当地国防工业在中国设计和制造的 99 式主战坦克的改进版本。99 式的开发始于 1999 年，该坦克于 2001 年在中国军队服役。99A 型的第一架原型机于 2007 年进行了测试，并于 2015 年 9 月在北京的阅兵式上首次亮相。它曾在 2014 年上海合作组织 （SCO） 军事演习期间被中国军队使用。它是第三代主战坦克，也是中国军队服役的最现代坦克。第三代使用独立于指挥官的瞄准具表示猎杀能力的能力。" },
            { name: "KF51主战坦克", quality: "epic", size: { width: 4, height: 4 }, glowColor: "#ff3333", probability: 10, description: "KF51“黑豹”主战坦克是德国莱茵金属公司研发的一款第四代主战坦克，于2022年欧洲防务展首次公开亮相。该坦克以“豹2”系列底盘为基础，但采用了多项创新技术，旨在提升火力、防护和信息化作战能力。" },
            { name: "机密文件", quality: "epic", size: { width: 2, height: 1 }, glowColor: "#ff3333", probability: 1, description: "该军规级光盘内封存了麦晓雯与黑卡蒂的机密影像资料，采用TMDCLS.pf级深度加密算法，仅能通过哈夫克防务部研制的量子密钥进行解码。可惜的是，该密钥在一次恐袭行动中失踪，至今下落不明。" },

            // rare 品质（紫色，中等）
            { name: "FAL突击步枪", quality: "rare", size: { width: 4, height: 2 }, glowColor: "#800080", probability: 15, description: "FA公司的知名产品FAL突击步枪，坚实可靠，使用方便，分解简单，气体调节器结构新颖，在军民两个市场上都大受好评，使用7.62×51毫米子弹。" },
            { name: "MP5K冲锋枪", quality: "rare", size: { width: 3, height: 2 }, glowColor: "#800080", probability: 20, description: "MP5K冲锋枪，来自赫尔卡公司的MP5微型冲锋枪衍生型号，结构短小紧凑，近距离交火拥有较强的火力，在个人防卫中表现优异，使用9×19毫米子弹。" },
            { name: "AKM突击步枪", quality: "rare", size: { width: 4, height: 2 }, glowColor: "#800080", probability: 20, description: "欧特斯制造厂研发的现代化改进版AKM突击步枪，这种武器已经成为AK枪族之中生产量最高及影响力最大的一员，使用7.62×39毫米子弹。" },
            { name: "AUG突击步枪", quality: "rare", size: { width: 4, height: 2 }, glowColor: "#800080", probability: 20, description: "AUG突击步枪，使用7.62口径子弹。" },
            { name: "IND70战术头盔", quality: "rare", size: { width: 2, height: 2 }, glowColor: "#800080", probability: 5, description: "超高规格防弹头盔，为满足战场单兵作战的需求而设计制造，所用的超高分子聚乙烯材料有效地平衡了性能与重量，具有高强度防弹功能，数量极少，只配给了部分战场尖兵。" },

            // common 品质（白色/灰色，低级）
            { name: "主卧室钥匙", quality: "common", size: { width: 1, height: 2 }, glowColor: "#666666", probability: 40, description: "主卧室钥匙，用于打开农场别墅二楼的卧室房间，可能会有珍贵物品。" },
            { name: "企划室钥匙", quality: "common", size: { width: 1, height: 2 }, glowColor: "#666666", probability: 40, description: "企划一部钥匙，用于打开电视台一楼企划一部，这里曾是电视台企划节目的地方，但是在战时被当作了临时指挥部。" },
           
            { name: "柠檬饮料", quality: "common", size: { width: 1, height: 1 }, glowColor: "#666666", probability: 50, description: "常见的柠檬味饮料，可以解渴消暑，但果汁含量较低。" },
            { name: "牛磺酸饮料", quality: "common", size: { width: 1, height: 1 }, glowColor: "#666666", probability: 40, description: "含有牛磺酸的功能运动饮料，能够快速补充水分。" },
            { name: "碳酸汽水", quality: "common", size: { width: 1, height: 1 }, glowColor: "#666666", probability: 40, description: "冠以太平洋之名的常见饮品，物美价廉，可以缓解身体疲劳。" },
            { name: "C++芒果汁", quality: "common", size: { width: 1, height: 2 }, glowColor: "#666666", probability: 40, description: "用水果原浆及其他配料调制而成的果汁，含有多种人体需要的营养成分。" },
            { name: "C++菠萝汁", quality: "common", size: { width: 1, height: 2 }, glowColor: "#666666", probability: 40, description: "浓缩菠萝汁，口味香浓纯正，具有提神醒脑的功效。" },
            { name: "苹果汁", quality: "common", size: { width: 1, height: 2 }, glowColor: "#666666", probability: 40, description: "含有果肉的苹果汁，营养丰富，清凉解渴，清爽可口。" },
            { name: "高山清泉", quality: "common", size: { width: 1, height: 2 }, glowColor: "#666666", probability: 40, description: "产自优质天然水源的瓶装饮用水，富含矿物元素。" },
            { name: "橙汁", quality: "common", size: { width: 1, height: 2 }, glowColor: "#666666", probability: 40, description: "美味的橙汁饮料，含有维生素C，营养健康，可以补充大量水分。" },
            { name: "牛奶", quality: "common", size: { width: 1, height: 2 }, glowColor: "#666666", probability: 40, description: "维利营养集团出品的金丝雀牛奶，口感醇厚，回味悠长，可以满足你的能量需求。" },
            { name: "红阳牌饮料", quality: "common", size: { width: 1, height: 2 }, glowColor: "#666666", probability: 40, description: "深受阿萨拉士兵喜爱的功能饮料，富含人体所需的多种物质，是战场上补充体能的不二之选。" },
            { name: "维奥啤酒", quality: "common", size: { width: 1, height: 2 }, glowColor: "#666666", probability: 40, description: "由维利营养出品的新款无酒精预制饮料，混合了滋补饮品，带有杜松子与橘类的清爽香气。" },
            { name: "维利保温杯", quality: "common", size: { width: 1, height: 2 }, glowColor: "#666666", probability: 40, description: "维利集团生产的保温水壶，容量大，密封严，可携带足量热水。" },
            // { name: "", quality: "common", size: { width: 1, height: 2 }, glowColor: "#666666", probability: 8, description: "" },
            // { name: "", quality: "common", size: { width: 1, height: 2 }, glowColor: "#666666", probability: 8, description: "" },
            // { name: "", quality: "common", size: { width: 1, height: 2 }, glowColor: "#666666", probability: 8, description: "" },
            // { name: "", quality: "common", size: { width: 1, height: 2 }, glowColor: "#666666", probability: 8, description: "" },
            // { name: "", quality: "common", size: { width: 1, height: 2 }, glowColor: "#666666", probability: 8, description: "" },
            { name: "201钥匙", quality: "common", size: { width: 1, height: 2 }, glowColor: "#666666", probability: 8, description: "一把普通的钥匙，用于打开农场汽车旅馆二楼外侧走廊的201房间。" },
        ];
        this.imageMap = {
            "安德斯轻型坦克": "./image/tnke/ANDERS_120mm_Light_Expeditionary_Tank_Obrum_Bumar_Poland_Polish_defence_industry_military_technology_001.png",
            "ABramsX主战坦克": "./image/tnke/AbramsX_MBT_Main_Battle_Tank_technology_demonstrator_GDLS_United_States_007.png",
            "99A主战坦克": "./image/tnke/Type_99A_A2_ZTZ-99A_main_battle_tank_China_Chinese_army_defense_industry_002.png",
            "99A装甲连": "./image/tnke/Type_99A_A2_ZTZ-99A_main_battle_tank_China_Chinese_army_defense_industry_003.png",
            "KF51主战坦克": "./image/tnke/KF51_Panther_MBT_Main_Battle_Tank_Rheinmetall_Germany_925_001.png",
            "机密文件": "./image/tnke/jimi.png",
            "AUG突击步枪": "./image/tnke/801011201.png",
            "FAL突击步枪": "./image/tnke/801010301.png",
            "主卧室钥匙": "./image/tnke/405010008.png",
            "企划室钥匙": "./image/tnke/405010005.png",
            "201钥匙": "./image/tnke/405020016.png",
            "MP5K冲锋枪": "./image/tnke/801022101.png",
            "AKM突击步枪": "./image/tnke/801010101.png",
            "IND70战术头盔": "./image/tnke/301040035.png",
            "柠檬饮料": "./image/tnke/404010003.png",
            "牛磺酸饮料": "./image/tnke/404010006.png",
            "碳酸汽水": "./image/tnke/404010007.png",
            "C++芒果汁": "./image/tnke/404010004.png",
            "C++菠萝汁": "./image/tnke/404010005.png",
            "苹果汁": "./image/tnke/404010002.png",
            "高山清泉": "./image/tnke/404010001.png",
            "橙汁": "./image/tnke/404010009.png",
            "牛奶": "./image/tnke/404010010.png",
            "红阳牌饮料": "./image/tnke/404010011.png",
            "维奥啤酒": "./image/tnke/404010016.png",
            "维利保温杯": "./image/tnke/404010008.png",
            // "": "",
            // "": "",
            // "": "",
            // "": "",
            // "": ""
        };
    }

    getRandomLoot() {
        const totalProbability = this.lootPool.reduce((sum, item) => sum + item.probability, 0);
        const randomValue = Math.random() * totalProbability;
        let cumulativeProbability = 0;
        for (const item of this.lootPool) {
            cumulativeProbability += item.probability;
            if (randomValue <= cumulativeProbability) {
                return item;
            }
        }
        return this.lootPool[this.lootPool.length - 1];
    }

    addLootItem(item) {
        this.lootPool.push(item);
    }

    removeLootItem(name) {
        this.lootPool = this.lootPool.filter(item => item.name !== name);
    }

    getImageForLoot(name) {
        return this.imageMap[name] || "https://via.placeholder.com/80x80/ffffff/000000?text=Unknown";
    }

    getDescriptionForLoot(name) {
        const item = this.lootPool.find(i => i.name === name);
        return item ? item.description : "未知物品";
    }
}

function lightenColor(hexColor, percent) {
    let r = parseInt(hexColor.slice(1, 3), 16);
    let g = parseInt(hexColor.slice(3, 5), 16);
    let b = parseInt(hexColor.slice(5, 7), 16);
    r = Math.min(255, Math.floor(r * (1 + percent / 100)));
    g = Math.min(255, Math.floor(g * (1 + percent / 100)));
    b = Math.min(255, Math.floor(b * (1 + percent / 100)));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

class HackSystem {
    constructor() {
        this.columns = Array.from(document.querySelectorAll('.column'));
        this.charWrappers = this.columns.map(col => col.querySelector('.char-wrapper'));
        this.currentStep = 0;
        this.attempts = 3;
        this.timeLeft = 30;
        this.animations = [];
        this.scrollSpeeds = [2.5, 3, 3.5];
        this.gameEnded = false;
        this.gameStarted = false;
        this.isProcessing = false;
        this.keyHandler = null;
        this.lootGenerator = new LootGenerator();
        this.initGame();
    }

    initGame() {
        this.cleanup();
        this.generatePassword();
        this.setupAnimations();
        this.setupEventListeners();
        this.updateUI();
        if (this.gameStarted) {
            this.startTimer();
        }
    }

    cleanup() {
        this.animations.forEach(a => {
            a.stop();
            if (a.clone && a.clone.parentNode) {
                a.clone.parentNode.removeChild(a.clone);
            }
        });
        this.animations = [];
        this.columns.forEach(col => {
            const extras = col.querySelectorAll('.char-wrapper:not(:first-child)');
            extras.forEach(e => e.remove());
        });
        const rewardGrid = document.getElementById('rewardGrid');
        const existingContainer = rewardGrid.querySelector('.animation-container');
        if (existingContainer) existingContainer.remove();
        const gridCells = document.querySelectorAll('.grid-cell');
        gridCells.forEach(cell => {
            cell.classList.remove('highlighted', 'common', 'rare', 'epic', 'epic-blank');
            cell.style.background = '#222';
            cell.style.border = '1px solid #444';
            cell.style.boxShadow = 'none';
        });
        const rewardImage = document.getElementById('rewardImage');
        rewardImage.innerHTML = '';
        rewardImage.classList.remove('revealed');
    }

    generatePassword() {
        this.charWrappers.forEach((wrapper, i) => {
            const chars = this.generateChars(15);
            const targetIndex = Math.floor(Math.random() * 10);
            chars[targetIndex].classList.add('highlight');
            wrapper.innerHTML = '';
            chars.forEach(c => wrapper.appendChild(c));
        });
    }

    generateChars(count) {
        const set = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%!';
        return Array.from({ length: count }, () => {
            const el = document.createElement('div');
            el.className = 'char';
            el.textContent = set[Math.floor(Math.random() * set.length)];
            return el;
        });
    }

    setupAnimations() {
        this.animations = this.columns.map((col, i) =>
            new ColumnAnimation(col, this.scrollSpeeds[i], i, this)
        );
    }

    setupEventListeners() {
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
        }

        this.keyHandler = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (!this.gameStarted) return;
                if (!this.isProcessing && !this.gameEnded) {
                    this.handleSelection();
                }
            }
        };
        document.addEventListener('keydown', this.keyHandler);

        document.getElementById('selectBtn').onclick = () => {
            if (!this.gameStarted) return;
            if (!this.isProcessing && !this.gameEnded) {
                this.handleSelection();
            }
        };
    }

    async handleSelection() {
        if (this.isProcessing ||
            this.currentStep >= 3 ||
            this.gameEnded ||
            this.attempts <= 0) return;

        this.isProcessing = true;

        const currentAnim = this.animations[this.currentStep];
        const isCorrect = currentAnim.checkPosition();

        if (isCorrect) {
            this.showFeedback("效验通过", true);
            this.currentStep++;

            currentAnim.pause();
            setTimeout(() => currentAnim.resume(), 500);

            if (this.currentStep >= 3) {
                this.gameOver(true);
            }
        } else {
            this.showFeedback("效验失败", false);
            this.attempts = Math.max(0, this.attempts - 1);

            currentAnim.pause();
            setTimeout(() => currentAnim.resume(), 300);

            if (this.attempts <= 0) {
                this.gameOver(false);
            }
        }

        this.updateUI();
        this.isProcessing = false;
    }

    updateUI() {
        document.getElementById('progress').style.width = `${Math.min(this.currentStep * 33.33, 100)}%`;
        document.getElementById('attempts').textContent = `剩余破译次数: ${this.attempts}/3`;
        this.columns.forEach((col, i) =>
            col.classList.toggle('active', i === this.currentStep)
        );
    }

    showFeedback(text, success) {
        const feedback = document.getElementById('feedback');
        feedback.textContent = text;
        feedback.className = `feedback ${success ? 'success' : 'fail'}`;
        feedback.style.opacity = '1';
        setTimeout(() => feedback.style.opacity = '0', 1000);
    }

    startTimer() {
        clearInterval(this.timer);
        this.timer = setInterval(() => {
            this.timeLeft = Math.max(0, this.timeLeft - 0.1);
            document.getElementById('timer').textContent = this.timeLeft.toFixed(1);
            if (this.timeLeft <= 0) this.gameOver(false);
        }, 100);
    }

    startGame() {
        this.gameStarted = true;
        document.getElementById('startBtn').style.display = 'none';
        document.getElementById('selectBtn').style.display = 'block';
        this.startTimer();
        this.updateUI();
    }

    updateWarehouse(item) {
        let warehouse = JSON.parse(localStorage.getItem('warehouse')) || {};

        if (warehouse[item.name]) {
            warehouse[item.name].count += 1;
        } else {
            warehouse[item.name] = {
                count: 1,
                image: this.lootGenerator.getImageForLoot(item.name),
                description: this.lootGenerator.getDescriptionForLoot(item.name)
            };
        }

        localStorage.setItem('warehouse', JSON.stringify(warehouse));
    }

    displayWarehouse() {
        const warehouseContent = document.getElementById('warehouseContent');
        const warehouse = JSON.parse(localStorage.getItem('warehouse')) || {};

        warehouseContent.innerHTML = '';

        if (Object.keys(warehouse).length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.textContent = '仓库为空，快去破解保险箱获取物品吧！';
            emptyMessage.style.color = '#aaa';
            emptyMessage.style.textAlign = 'center';
            emptyMessage.style.padding = '20px';
            warehouseContent.appendChild(emptyMessage);
            return;
        }

        for (const [name, data] of Object.entries(warehouse)) {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'warehouse-item';

            const img = document.createElement('img');
            img.src = data.image;
            img.alt = name;

            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'warehouse-item-details';

            const nameDiv = document.createElement('div');
            nameDiv.className = 'warehouse-item-name';
            nameDiv.textContent = name;

            const countDiv = document.createElement('div');
            countDiv.className = 'warehouse-item-count';
            countDiv.textContent = `数量: ${data.count}`;

            const descriptionDiv = document.createElement('div');
            descriptionDiv.className = 'warehouse-item-description';
            descriptionDiv.textContent = data.description;

            const item = this.lootGenerator.lootPool.find(i => i.name === name);
            if (item) {
                if (item.quality === 'epic') {
                    descriptionDiv.style.color = '#ff3333'; // 红色
                } else if (item.quality === 'rare') {
                    descriptionDiv.style.color = '#800080'; // 紫色
                } else {
                    descriptionDiv.style.color = '#999'; // 灰色
                }
            }

            detailsDiv.appendChild(nameDiv);
            detailsDiv.appendChild(countDiv);
            detailsDiv.appendChild(descriptionDiv);

            itemDiv.appendChild(img);
            itemDiv.appendChild(detailsDiv);

            warehouseContent.appendChild(itemDiv);
        }
    }

    clearWarehouse() {
        localStorage.removeItem('warehouse');
        this.displayWarehouse();
    }

    finishAnimation(animationContainer) {
        const mask = animationContainer.querySelector('.item-mask');
        const flash = animationContainer.querySelector('.flash-overlay');
        const rewardImage = document.getElementById('rewardImage');
        const rewardGrid = document.getElementById('rewardGrid');

        flash.classList.add('flash');

        setTimeout(() => {
            mask.style.display = 'none';
            rewardImage.classList.add('revealed');
            rewardGrid.classList.add('revealed');
            flash.classList.remove('flash');
        }, 500);
    }

    gameOver(success) {
        if (this.gameEnded) return;
        this.gameEnded = true;

        clearInterval(this.timer);
        this.animations.forEach(a => a.stop());
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
        }

        if (success) {
            const reward = this.lootGenerator.getRandomLoot();
            console.log('Selected Reward:', reward);

            this.updateWarehouse(reward);

            const highlightedCells = document.querySelectorAll('.grid-cell');
            const gridWidth = 4;
            const gridHeight = 4;
            const { width, height } = reward.size;

            // 重置所有网格单元
            highlightedCells.forEach(cell => {
                cell.classList.remove('highlighted', 'common', 'rare', 'epic', 'epic-blank');
                cell.style.background = '#222';
                cell.style.border = '1px solid #444';
                cell.style.boxShadow = 'none';
            });

            // 高亮被战利品占用的网格单元
            const occupiedIndices = new Set();
            for (let row = 0; row < height; row++) {
                for (let col = 0; col < width; col++) {
                    const index = row * gridWidth + col;
                    if (index < highlightedCells.length) {
                        highlightedCells[index].classList.add('highlighted', reward.quality);
                        highlightedCells[index].style.boxShadow = `0 0 15px ${reward.glowColor}`;
                        occupiedIndices.add(index);
                    }
                }
            }

            // 如果是 epic 品质，空白网格单元变为亮红色并添加闪光效果
            if (reward.quality === 'epic') {
                highlightedCells.forEach((cell, index) => {
                    if (!occupiedIndices.has(index)) {
                        cell.classList.add('epic-blank');
                    }
                });
            }

            const animationContainer = document.createElement('div');
            animationContainer.className = `animation-container`;
            animationContainer.style.gridColumn = `1 / ${Math.min(width + 1, 5)}`;
            animationContainer.style.gridRow = `1 / ${Math.min(height + 1, 5)}`;
            animationContainer.style.width = `${width * 80}px`;
            animationContainer.style.height = `${height * 80}px`;

            const itemMask = document.createElement('div');
            itemMask.className = 'item-mask';
            const diagonalStripes = document.createElement('div');
            diagonalStripes.className = 'diagonal-stripes';
            const magnifier = document.createElement('div');
            magnifier.className = 'magnifier';
            itemMask.appendChild(diagonalStripes);
            itemMask.appendChild(magnifier);

            const flashOverlay = document.createElement('div');
            flashOverlay.className = 'flash-overlay';
            flashOverlay.style.setProperty('--quality-start', reward.glowColor);
            flashOverlay.style.setProperty('--quality-end', lightenColor(reward.glowColor, 20));

            animationContainer.appendChild(itemMask);
            animationContainer.appendChild(flashOverlay);

            const rewardGrid = document.getElementById('rewardGrid');
            rewardGrid.appendChild(animationContainer);

            const rewardImage = document.getElementById('rewardImage');
            rewardImage.style.gridColumn = `1 / ${Math.min(width + 1, 5)}`;
            rewardImage.style.gridRow = `1 / ${Math.min(height + 1, 5)}`;
            rewardImage.style.width = `${width * 80}px`;
            rewardImage.style.height = `${height * 80}px`;
            rewardImage.setAttribute('data-item', reward.name);
            rewardImage.style.setProperty('--glow-color', reward.glowColor);

            const img = document.createElement('img');
            img.src = this.lootGenerator.getImageForLoot(reward.name);
            img.alt = reward.name;
            rewardImage.appendChild(img);

            document.getElementById('rewardScreen').style.display = 'flex';

            setTimeout(() => {
                this.finishAnimation(animationContainer);
            }, 2000);
        } else {
            document.getElementById('failureScreen').style.display = 'flex';
        }
    }

    resetGame() {
        this.currentStep = 0;
        this.attempts = 3;
        this.timeLeft = 30;
        this.gameEnded = false;
        this.gameStarted = false;
        document.getElementById('rewardScreen').style.display = 'none';
        document.getElementById('failureScreen').style.display = 'none';
        document.getElementById('warehouseScreen').style.display = 'none';
        document.getElementById('startBtn').style.display = 'block';
        document.getElementById('selectBtn').style.display = 'none';
        this.cleanup();
        this.initGame();
    }
}

let hackGame = new HackSystem();
window.resetGame = () => hackGame.resetGame();
window.startGame = () => hackGame.startGame();
window.showWarehouse = () => {
    document.getElementById('warehouseScreen').style.display = 'flex';
    hackGame.displayWarehouse();
};
window.hideWarehouse = () => {
    document.getElementById('warehouseScreen').style.display = 'none';
};
window.clearWarehouse = () => {
    hackGame.clearWarehouse();
};