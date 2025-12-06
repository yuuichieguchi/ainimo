import { renderHook, act } from '@testing-library/react';
import { useWeather } from '@/hooks/effects/useWeather';

describe('useWeather', () => {
  describe('initialization', () => {
    it('should use initialWeather when provided', () => {
      const { result } = renderHook(() =>
        useWeather({ initialWeather: 'rainy', randomizeOnMount: false })
      );

      expect(result.current.weather).toBe('rainy');
    });

    it('should use sunny as default when randomizeOnMount is false and no initialWeather', () => {
      const { result } = renderHook(() =>
        useWeather({ randomizeOnMount: false })
      );

      expect(result.current.weather).toBe('sunny');
    });

    it('should randomize weather when randomizeOnMount is true', () => {
      const validWeathers = ['sunny', 'cloudy', 'rainy', 'snowy'];
      const { result } = renderHook(() =>
        useWeather({ randomizeOnMount: true })
      );

      expect(validWeathers).toContain(result.current.weather);
    });

    it('should prioritize initialWeather over randomizeOnMount', () => {
      const { result } = renderHook(() =>
        useWeather({ initialWeather: 'snowy', randomizeOnMount: true })
      );

      expect(result.current.weather).toBe('snowy');
    });
  });

  describe('setWeather', () => {
    it('should change weather when setWeather is called', () => {
      const { result } = renderHook(() =>
        useWeather({ initialWeather: 'sunny', randomizeOnMount: false })
      );

      act(() => {
        result.current.setWeather('rainy');
      });

      expect(result.current.weather).toBe('rainy');
    });
  });

  describe('randomizeWeather', () => {
    it('should change weather to a valid value when randomizeWeather is called', () => {
      const validWeathers = ['sunny', 'cloudy', 'rainy', 'snowy'];
      const { result } = renderHook(() =>
        useWeather({ initialWeather: 'sunny', randomizeOnMount: false })
      );

      act(() => {
        result.current.randomizeWeather();
      });

      expect(validWeathers).toContain(result.current.weather);
    });
  });

  describe('derived values', () => {
    it('should return correct weatherIcon for sunny', () => {
      const { result } = renderHook(() =>
        useWeather({ initialWeather: 'sunny', randomizeOnMount: false })
      );

      expect(result.current.weatherIcon).toBe('☀️');
    });

    it('should return correct weatherIcon for rainy', () => {
      const { result } = renderHook(() =>
        useWeather({ initialWeather: 'rainy', randomizeOnMount: false })
      );

      expect(result.current.weatherIcon).toBe('🌧️');
    });

    it('should return correct brightness for different weathers', () => {
      const { result: sunnyResult } = renderHook(() =>
        useWeather({ initialWeather: 'sunny', randomizeOnMount: false })
      );
      expect(sunnyResult.current.brightness).toBe(1);

      const { result: rainyResult } = renderHook(() =>
        useWeather({ initialWeather: 'rainy', randomizeOnMount: false })
      );
      expect(rainyResult.current.brightness).toBe(0.7);
    });

    it('should return correct isRaining and isSnowing flags', () => {
      const { result: rainyResult } = renderHook(() =>
        useWeather({ initialWeather: 'rainy', randomizeOnMount: false })
      );
      expect(rainyResult.current.isRaining).toBe(true);
      expect(rainyResult.current.isSnowing).toBe(false);

      const { result: snowyResult } = renderHook(() =>
        useWeather({ initialWeather: 'snowy', randomizeOnMount: false })
      );
      expect(snowyResult.current.isRaining).toBe(false);
      expect(snowyResult.current.isSnowing).toBe(true);
    });
  });
});
