import { render, waitFor } from '@testing-library/react';
import DynamicLangUpdater from '@/components/DynamicLangUpdater';

const mockUseLanguage = jest.fn();
jest.mock('@/hooks/useLanguage', () => ({
  useLanguage: () => mockUseLanguage(),
}));

describe('DynamicLangUpdater', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.documentElement.lang = 'en';
  });

  it('should update document lang to ja when language is ja and mounted', async () => {
    mockUseLanguage.mockReturnValue({ language: 'ja', mounted: true });

    render(<DynamicLangUpdater />);

    await waitFor(() => {
      expect(document.documentElement.lang).toBe('ja');
    });
  });

  it('should update document lang to en when language is en and mounted', async () => {
    mockUseLanguage.mockReturnValue({ language: 'en', mounted: true });

    render(<DynamicLangUpdater />);

    await waitFor(() => {
      expect(document.documentElement.lang).toBe('en');
    });
  });

  it('should not update lang when not mounted', () => {
    document.documentElement.lang = 'en';
    mockUseLanguage.mockReturnValue({ language: 'ja', mounted: false });

    render(<DynamicLangUpdater />);

    expect(document.documentElement.lang).toBe('en');
  });

  it('should render nothing', () => {
    mockUseLanguage.mockReturnValue({ language: 'en', mounted: true });

    const { container } = render(<DynamicLangUpdater />);

    expect(container.firstChild).toBeNull();
  });
});
