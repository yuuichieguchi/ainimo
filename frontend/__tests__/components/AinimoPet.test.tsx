import React from 'react';
import { render } from '@testing-library/react';
import { AinimoPet } from '@/components/AinimoPet';
import { GameParameters } from '@/types/game';

describe('AinimoPet', () => {
  const mockParameters: GameParameters = {
    level: 1,
    xp: 0,
    intelligence: 30,
    memory: 50,
    friendliness: 50,
    energy: 80,
    mood: 70,
  };

  describe('ref forwarding', () => {
    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      
      render(
        <AinimoPet 
          ref={ref} 
          parameters={mockParameters} 
          language="en"
          currentActivity={null}
        />
      );

      expect(ref.current).not.toBeNull();
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('should attach ref to the root container element', () => {
      const ref = React.createRef<HTMLDivElement>();
      
      const { container } = render(
        <AinimoPet 
          ref={ref} 
          parameters={mockParameters} 
          language="en"
          currentActivity={null}
        />
      );

      const rootDiv = container.querySelector('.flex.flex-col');
      expect(ref.current).toBe(rootDiv);
    });
  });
});
