import {
  getItemPrice,
  canPurchaseItem,
  purchaseItem,
  hasItem,
} from '@/lib/itemEngine';
import { getInitialInventory } from '@/lib/itemDefinitions';
import { PlayerInventory, RARITY_PRICES } from '@/types/item';

describe('Shop Functions', () => {
  describe('getItemPrice', () => {
    it('should return correct price for common items', () => {
      const commonItem = {
        id: 'test',
        name: { en: 'Test', ja: 'テスト' },
        description: { en: 'Test', ja: 'テスト' },
        category: 'hat' as const,
        rarity: 'common' as const,
        icon: '🎀',
        dropWeight: 60,
      };
      expect(getItemPrice(commonItem)).toBe(RARITY_PRICES.common);
    });

    it('should return correct price for rare items', () => {
      const rareItem = {
        id: 'test',
        name: { en: 'Test', ja: 'テスト' },
        description: { en: 'Test', ja: 'テスト' },
        category: 'hat' as const,
        rarity: 'rare' as const,
        icon: '🎀',
        dropWeight: 25,
      };
      expect(getItemPrice(rareItem)).toBe(RARITY_PRICES.rare);
    });

    it('should return correct price for epic items', () => {
      const epicItem = {
        id: 'test',
        name: { en: 'Test', ja: 'テスト' },
        description: { en: 'Test', ja: 'テスト' },
        category: 'hat' as const,
        rarity: 'epic' as const,
        icon: '🎀',
        dropWeight: 12,
      };
      expect(getItemPrice(epicItem)).toBe(RARITY_PRICES.epic);
    });

    it('should return correct price for legendary items', () => {
      const legendaryItem = {
        id: 'test',
        name: { en: 'Test', ja: 'テスト' },
        description: { en: 'Test', ja: 'テスト' },
        category: 'hat' as const,
        rarity: 'legendary' as const,
        icon: '🎀',
        dropWeight: 3,
      };
      expect(getItemPrice(legendaryItem)).toBe(RARITY_PRICES.legendary);
    });
  });

  describe('canPurchaseItem', () => {
    it('should return true when player has enough coins and does not own item', () => {
      const inventory: PlayerInventory = {
        ...getInitialInventory(),
        coins: 100,
      };
      // hat_ribbon is a common item (50 coins)
      expect(canPurchaseItem(inventory, 'hat_ribbon')).toBe(true);
    });

    it('should return false when player does not have enough coins', () => {
      const inventory: PlayerInventory = {
        ...getInitialInventory(),
        coins: 10,
      };
      expect(canPurchaseItem(inventory, 'hat_ribbon')).toBe(false);
    });

    it('should return false when player already owns the item', () => {
      const inventory: PlayerInventory = {
        ...getInitialInventory(),
        coins: 100,
        items: [{ itemId: 'hat_ribbon', acquiredAt: Date.now() }],
      };
      expect(canPurchaseItem(inventory, 'hat_ribbon')).toBe(false);
    });

    it('should return false for invalid item id', () => {
      const inventory: PlayerInventory = {
        ...getInitialInventory(),
        coins: 1000,
      };
      expect(canPurchaseItem(inventory, 'invalid_item')).toBe(false);
    });
  });

  describe('purchaseItem', () => {
    it('should deduct coins and add item to inventory on successful purchase', () => {
      const inventory: PlayerInventory = {
        ...getInitialInventory(),
        coins: 100,
      };

      const result = purchaseItem(inventory, 'hat_ribbon');

      expect(result).not.toBeNull();
      expect(result!.coins).toBe(50); // 100 - 50 (common price)
      expect(hasItem(result!, 'hat_ribbon')).toBe(true);
    });

    it('should return null when player does not have enough coins', () => {
      const inventory: PlayerInventory = {
        ...getInitialInventory(),
        coins: 10,
      };

      const result = purchaseItem(inventory, 'hat_ribbon');
      expect(result).toBeNull();
    });

    it('should return null when player already owns the item', () => {
      const inventory: PlayerInventory = {
        ...getInitialInventory(),
        coins: 100,
        items: [{ itemId: 'hat_ribbon', acquiredAt: Date.now() }],
      };

      const result = purchaseItem(inventory, 'hat_ribbon');
      expect(result).toBeNull();
    });

    it('should return null for invalid item id', () => {
      const inventory: PlayerInventory = {
        ...getInitialInventory(),
        coins: 1000,
      };

      const result = purchaseItem(inventory, 'invalid_item');
      expect(result).toBeNull();
    });

    it('should correctly purchase a legendary item', () => {
      const inventory: PlayerInventory = {
        ...getInitialInventory(),
        coins: 1500,
      };

      // hat_halo is a legendary item (1000 coins)
      const result = purchaseItem(inventory, 'hat_halo');

      expect(result).not.toBeNull();
      expect(result!.coins).toBe(500); // 1500 - 1000 (legendary price)
      expect(hasItem(result!, 'hat_halo')).toBe(true);
    });
  });
});
