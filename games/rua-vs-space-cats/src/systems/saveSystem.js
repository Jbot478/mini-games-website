// Save System - Auto-saves after every level
class SaveSystem {
    constructor() {
        this.saveKey = 'rua_vs_space_cats_save';
        this.defaultSave = {
            currentLevel: 0,
            completedLevels: [],
            unlockedAbilities: [],
            playTime: 0,
            lastSaved: null
        };
    }

    save(levelNumber) {
        const saveData = this.load();

        // Update current level
        saveData.currentLevel = levelNumber;

        // Mark level as completed
        if (!saveData.completedLevels.includes(levelNumber)) {
            saveData.completedLevels.push(levelNumber);
        }

        // Update timestamp
        saveData.lastSaved = new Date().toISOString();

        // Save to localStorage
        localStorage.setItem(this.saveKey, JSON.stringify(saveData));

        console.log(`💾 Auto-saved at Level ${levelNumber}`);
        return saveData;
    }

    load() {
        const savedData = localStorage.getItem(this.saveKey);
        if (savedData) {
            return JSON.parse(savedData);
        }
        return { ...this.defaultSave };
    }

    unlockAbility(abilityName) {
        const saveData = this.load();
        if (!saveData.unlockedAbilities.includes(abilityName)) {
            saveData.unlockedAbilities.push(abilityName);
            localStorage.setItem(this.saveKey, JSON.stringify(saveData));
            console.log(`✨ Unlocked: ${abilityName}`);
        }
    }

    hasAbility(abilityName) {
        const saveData = this.load();
        return saveData.unlockedAbilities.includes(abilityName);
    }

    reset() {
        localStorage.removeItem(this.saveKey);
        console.log('🗑️ Save data reset');
    }

    getCurrentLevel() {
        const saveData = this.load();
        return saveData.currentLevel;
    }
}

// Global instance
const saveSystem = new SaveSystem();
