import {
  addItemToInventory,
  addCoins,
  spendCoins,
  equipItem,
  unequipItem,
  hasItem,
  getEquippedItem,
  getInventoryItemsByCategory,
  countItemsByRarity,
  countUniqueItems,
  countTotalItems,
  calculateCollectionProgress,
  isFullyEquipped,
  isValidInventory,
  migrateInventory,
} from '@/lib/itemEngine';
import { getInitialInventory, getItemById } from '@/lib/itemDefinitions';
import { PlayerInventory } from '@/types/item';

describe('itemEngine', () => {
  let inventory: PlayerInventory;

  beforeEach(() => {
    inventory = getInitialInventory();
  });

  describe('addItemToInventory', () => {
    it('should add item to empty inventory', () => {
      const newInventory = addItemToInventory(inventory, 'hat_ribbon');
      expect(newInventory.items.length).toBe(1);
      expect(newInventory.items[0].itemId).toBe('hat_ribbon');
      expect(newInventory.items[0].acquiredAt).toBeGreaterThan(0);
    });

    it('should add multiple items', () => {
      let newInventory = addItemToInventory(inventory, 'hat_ribbon');
      newInventory = addItemToInventory(newInventory, 'acc_bowtie');
      expect(newInventory.items.length).toBe(2);
    });

    it('should return unchanged inventory for invalid item id', () => {
      const newInventory = addItemToInventory(inventory, 'invalid_item');
      expect(newInventory.items.length).toBe(0);
    });

    it('should allow duplicate items', () => {
      let newInventory = addItemToInventory(inventory, 'hat_ribbon');
      newInventory = addItemToInventory(newInventory, 'hat_ribbon');
      expect(newInventory.items.length).toBe(2);
    });
  });

  describe('addCoins', () => {
    it('should add coins to inventory', () => {
      const newInventory = addCoins(inventory, 100);
      expect(newInventory.coins).toBe(100);
    });

    it('should accumulate coins', () => {
      let newInventory = addCoins(inventory, 50);
      newInventory = addCoins(newInventory, 30);
      expect(newInventory.coins).toBe(80);
    });

    it('should not add negative coins', () => {
      const newInventory = addCoins(inventory, -50);
      expect(newInventory.coins).toBe(0);
    });
  });

  describe('spendCoins', () => {
    it('should spend coins when sufficient', () => {
      let newInventory = addCoins(inventory, 100);
      newInventory = spendCoins(newInventory, 30) as PlayerInventory;
      expect(newInventory.coins).toBe(70);
    });

    it('should return null when insufficient coins', () => {
      const result = spendCoins(inventory, 100);
      expect(result).toBeNull();
    });

    it('should not spend negative amount', () => {
      const newInventory = addCoins(inventory, 100);
      const result = spendCoins(newInventory, -50);
      expect(result?.coins).toBe(100);
    });
  });

  describe('equipItem', () => {
    it('should equip owned item', () => {
      let newInventory = addItemToInventory(inventory, 'hat_ribbon');
      newInventory = equipItem(newInventory, 'hat_ribbon') as PlayerInventory;
      expect(newInventory.equipped.hat).toBe('hat_ribbon');
    });

    it('should return null for unowned item', () => {
      const result = equipItem(inventory, 'hat_ribbon');
      expect(result).toBeNull();
    });

    it('should replace existing equipped item', () => {
      let newInventory = addItemToInventory(inventory, 'hat_ribbon');
      newInventory = addItemToInventory(newInventory, 'hat_cap');
      newInventory = equipItem(newInventory, 'hat_ribbon') as PlayerInventory;
      newInventory = equipItem(newInventory, 'hat_cap') as PlayerInventory;
      expect(newInventory.equipped.hat).toBe('hat_cap');
    });
  });

  describe('unequipItem', () => {
    it('should unequip item from slot', () => {
      let newInventory = addItemToInventory(inventory, 'hat_ribbon');
      newInventory = equipItem(newInventory, 'hat_ribbon') as PlayerInventory;
      newInventory = unequipItem(newInventory, 'hat');
      expect(newInventory.equipped.hat).toBeNull();
    });

    it('should handle already empty slot', () => {
      const newInventory = unequipItem(inventory, 'hat');
      expect(newInventory.equipped.hat).toBeNull();
    });
  });

  describe('hasItem', () => {
    it('should return true for owned item', () => {
      const newInventory = addItemToInventory(inventory, 'hat_ribbon');
      expect(hasItem(newInventory, 'hat_ribbon')).toBe(true);
    });

    it('should return false for unowned item', () => {
      expect(hasItem(inventory, 'hat_ribbon')).toBe(false);
    });
  });

  describe('getEquippedItem', () => {
    it('should return equipped item', () => {
      let newInventory = addItemToInventory(inventory, 'hat_ribbon');
      newInventory = equipItem(newInventory, 'hat_ribbon') as PlayerInventory;
      const item = getEquippedItem(newInventory, 'hat');
      expect(item).not.toBeNull();
      expect(item?.id).toBe('hat_ribbon');
    });

    it('should return null for empty slot', () => {
      const item = getEquippedItem(inventory, 'hat');
      expect(item).toBeNull();
    });
  });

  describe('getInventoryItemsByCategory', () => {
    it('should filter items by category', () => {
      let newInventory = addItemToInventory(inventory, 'hat_ribbon');
      newInventory = addItemToInventory(newInventory, 'hat_cap');
      newInventory = addItemToInventory(newInventory, 'acc_bowtie');

      const hats = getInventoryItemsByCategory(newInventory, 'hat');
      expect(hats.length).toBe(2);
      expect(hats.every((item) => item.category === 'hat')).toBe(true);
    });

    it('should return empty array for no items in category', () => {
      const newInventory = addItemToInventory(inventory, 'hat_ribbon');
      const backgrounds = getInventoryItemsByCategory(newInventory, 'background');
      expect(backgrounds.length).toBe(0);
    });
  });

  describe('countItemsByRarity', () => {
    it('should count items by rarity', () => {
      let newInventory = addItemToInventory(inventory, 'hat_ribbon'); // common
      newInventory = addItemToInventory(newInventory, 'hat_cap'); // common
      newInventory = addItemToInventory(newInventory, 'hat_flower'); // rare

      const counts = countItemsByRarity(newInventory);
      expect(counts.common).toBe(2);
      expect(counts.rare).toBe(1);
      expect(counts.epic).toBe(0);
      expect(counts.legendary).toBe(0);
    });
  });

  describe('countUniqueItems', () => {
    it('should count unique items', () => {
      let newInventory = addItemToInventory(inventory, 'hat_ribbon');
      newInventory = addItemToInventory(newInventory, 'hat_ribbon'); // duplicate
      newInventory = addItemToInventory(newInventory, 'hat_cap');

      expect(countUniqueItems(newInventory)).toBe(2);
    });
  });

  describe('countTotalItems', () => {
    it('should count total items including duplicates', () => {
      let newInventory = addItemToInventory(inventory, 'hat_ribbon');
      newInventory = addItemToInventory(newInventory, 'hat_ribbon');
      newInventory = addItemToInventory(newInventory, 'hat_cap');

      expect(countTotalItems(newInventory)).toBe(3);
    });
  });

  describe('calculateCollectionProgress', () => {
    it('should calculate collection progress', () => {
      let newInventory = addItemToInventory(inventory, 'hat_ribbon');
      newInventory = addItemToInventory(newInventory, 'hat_cap');

      const progress = calculateCollectionProgress(newInventory);
      expect(progress.collected).toBe(2);
      expect(progress.total).toBe(18); // 18 items total
      expect(progress.percentage).toBe(Math.round((2 / 18) * 100));
    });
  });

  describe('isFullyEquipped', () => {
    it('should return false when not all slots are filled', () => {
      expect(isFullyEquipped(inventory)).toBe(false);
    });

    it('should return true when all slots are filled', () => {
      let newInventory = addItemToInventory(inventory, 'hat_ribbon');
      newInventory = addItemToInventory(newInventory, 'acc_bowtie');
      newInventory = addItemToInventory(newInventory, 'bg_meadow');
      newInventory = equipItem(newInventory, 'hat_ribbon') as PlayerInventory;
      newInventory = equipItem(newInventory, 'acc_bowtie') as PlayerInventory;
      newInventory = equipItem(newInventory, 'bg_meadow') as PlayerInventory;

      expect(isFullyEquipped(newInventory)).toBe(true);
    });
  });

  describe('isValidInventory', () => {
    it('should return true for valid inventory', () => {
      expect(isValidInventory(inventory)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isValidInventory(null)).toBe(false);
    });

    it('should return false for invalid coins', () => {
      expect(isValidInventory({ ...inventory, coins: -1 })).toBe(false);
    });

    it('should return false for invalid items', () => {
      expect(isValidInventory({ ...inventory, items: 'invalid' })).toBe(false);
    });

    it('should return false for invalid equipped', () => {
      expect(isValidInventory({ ...inventory, equipped: null })).toBe(false);
    });
  });

  describe('migrateInventory', () => {
    it('should return inventory if valid', () => {
      const result = migrateInventory(inventory);
      expect(result).toEqual(inventory);
    });

    it('should return initial inventory for invalid data', () => {
      const result = migrateInventory(null);
      expect(result).toEqual(getInitialInventory());
    });
  });
});
