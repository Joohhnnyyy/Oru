import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import '../i18n';
import en from '../i18n/en.json';
import hi from '../i18n/hi.json';
import { LandingPage } from '../pages/landing/LandingPage';
import { FlipCard, GUARDIANS } from '../pages/landing/sections/Guardians';
import { NAV_IDS } from '../pages/landing/sections/shared';
import { SplitCards } from '../pages/landing/sections/SplitCards';

type Tree = { [key: string]: string | Tree };

function leaves(tree: Tree, prefix = ''): Record<string, string> {
  return Object.entries(tree).reduce<Record<string, string>>((acc, [k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    return typeof v === 'string' ? { ...acc, [key]: v } : { ...acc, ...leaves(v, key) };
  }, {});
}

describe('i18n bundles', () => {
  const enKeys = leaves(en);
  const hiKeys = leaves(hi);

  it('has the same keys in English and Hindi', () => {
    expect(Object.keys(hiKeys).sort()).toEqual(Object.keys(enKeys).sort());
  });

  it('has no empty strings and keeps interpolation variables', () => {
    for (const [key, value] of Object.entries(enKeys)) {
      expect(value.trim(), key).not.toBe('');
      expect(hiKeys[key]?.trim(), key).not.toBe('');
      const vars = (s: string) => (s.match(/\{\{\w+\}\}/g) ?? []).sort();
      expect(vars(hiKeys[key] ?? ''), key).toEqual(vars(value));
    }
  });
});

describe('LandingPage', () => {
  it('has one h1, a skip link and every nav target', () => {
    const { container } = render(<LandingPage />);
    expect(container.querySelectorAll('h1')).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#main');
    for (const id of [...NAV_IDS, 'next', 'mission', 'about']) expect(container.querySelector(`#${id}`), id).not.toBeNull();
  });

  it('gives every image an alt attribute and every svg a label or aria-hidden', () => {
    const { container } = render(<LandingPage />);
    for (const img of container.querySelectorAll('img')) expect(img.hasAttribute('alt'), img.outerHTML.slice(0, 100)).toBe(true);
    for (const svg of container.querySelectorAll('svg')) {
      const labelled = (svg.getAttribute('role') === 'img' || svg.getAttribute('role') === 'group') && svg.hasAttribute('aria-label');
      const decorative = svg.closest('[aria-hidden="true"]') !== null;
      expect(labelled || decorative, svg.outerHTML.slice(0, 100)).toBe(true);
    }
  });

  it('steps through hero highlights with the carousel buttons', async () => {
    const user = userEvent.setup();
    render(<LandingPage />);
    const highlights = screen.getByRole('complementary', { name: 'Highlights' });
    expect(within(highlights).getByText('Your first day takes about a minute')).toBeInTheDocument();
    await user.click(within(highlights).getByRole('button', { name: 'Pause highlights' }));
    await user.click(within(highlights).getByRole('button', { name: 'Next highlight' }));
    expect(await within(highlights).findByText('Six guardians are waiting to wake up')).toBeInTheDocument();
  });

  it('opens the impact and roadmap pills in place', async () => {
    const user = userEvent.setup();
    render(<LandingPage />);
    const impact = screen.getByRole('button', { name: /Oru in numbers/ });
    expect(impact).toHaveAttribute('aria-expanded', 'false');
    await user.click(impact);
    expect(impact).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('guardians to wake')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /What comes next/ }));
    expect(await screen.findByText('A pilot in one city')).toBeInTheDocument();
  });
});

describe('FlipCard', () => {
  it('flips with Enter and Space and only exposes the visible face', async () => {
    const user = userEvent.setup();
    const crane = GUARDIANS.find((g) => g.id === 'crane');
    if (!crane) throw new Error('crane missing');
    render(<FlipCard {...crane} />);
    const card = screen.getByRole('button', { name: /Sarus crane/ });
    expect(card).toHaveAttribute('aria-pressed', 'false');

    card.focus();
    await user.keyboard('{Enter}');
    expect(card).toHaveAttribute('aria-pressed', 'true');
    expect(card.querySelector('.flip-front')).toHaveAttribute('aria-hidden', 'true');
    expect(card.querySelector('.flip-back')).toHaveAttribute('aria-hidden', 'false');
    expect(card).toHaveAccessibleName(expect.stringContaining('tallest flying bird'));

    await user.keyboard(' ');
    expect(card).toHaveAttribute('aria-pressed', 'false');
  });
});

describe('Split cards', () => {
  it('updates the places panel from the list and from the map with the keyboard', async () => {
    const user = userEvent.setup();
    render(<SplitCards />);
    const places = document.getElementById('places') as HTMLElement;
    const list = within(places).getByRole('heading', { name: 'Regions' }).nextElementSibling as HTMLElement;

    await user.click(within(list).getByRole('button', { name: 'Coasts and islands' }));
    expect(within(places).getByRole('heading', { level: 3, name: 'Coasts and islands' })).toBeInTheDocument();
    expect(within(places).getByRole('link', { name: 'Meet the Sea turtle' })).toHaveAttribute('href', '#guardian-turtle');

    const map = within(places).getByRole('group', { name: /pixel map of India/ });
    const mountains = within(map).getByRole('button', { name: 'High mountains' });
    mountains.focus();
    await user.keyboard('{Enter}');
    expect(mountains).toHaveAttribute('aria-pressed', 'true');
    expect(within(places).getByText('Guardian: Snow leopard')).toBeInTheDocument();
  });

  it('lets people pick a growth stage', async () => {
    const user = userEvent.setup();
    render(<SplitCards />);
    const growth = document.getElementById('growth') as HTMLElement;
    const forest = within(growth).getByRole('button', { name: 'Forest' });
    await user.click(forest);
    expect(forest).toHaveAttribute('aria-pressed', 'true');
    expect(within(growth).getByText(/your plot is a small green city/)).toBeInTheDocument();
  });
});
