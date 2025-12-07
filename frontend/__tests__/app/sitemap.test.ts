import sitemap from '@/app/sitemap';

describe('sitemap', () => {
  it('should return sitemap with correct base URL', () => {
    const result = sitemap();

    expect(result).toHaveLength(1);
    expect(result[0].url).toBe('https://ainimo.vercel.app');
  });

  it('should have correct sitemap properties', () => {
    const result = sitemap();

    expect(result[0].changeFrequency).toBe('weekly');
    expect(result[0].priority).toBe(1);
    expect(result[0].lastModified).toBeInstanceOf(Date);
  });
});
