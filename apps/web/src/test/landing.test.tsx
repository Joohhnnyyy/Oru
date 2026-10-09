import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import '../i18n';
import en from '../i18n/en.json';
import hi from '../i18n/hi.json';
import { CHAPTER_IDS } from '../pages/landing/chapters';
import { LandingPage } from '../pages/landing/LandingPage';
import { FlipCard } from '../pages/landing/sections/Guardians';
import { Places } from '../pages/landing/sections/Places';

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
  it('has one h1, a skip link and every chapter section', () => {
    const { container } = render(<LandingPage />);
    expect(container.querySelectorAll('h1')).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#main');
    for (const id of CHAPTER_IDS) expect(container.querySelector(`section#${id}`), id).not.toBeNull();
  });

  it('labels every meaningful image', () => {
    const { container } = render(<LandingPage />);
    for (const svg of container.querySelectorAll('svg')) {
      const labelled = svg.getAttribute('role') === 'img' && svg.hasAttribute('aria-label');
      const decorative = svg.closest('[aria-hidden="true"]') !== null;
      const group = svg.getAttribute('role') === 'group' && svg.hasAttribute('aria-label');
      expect(labelled || decorative || group, svg.outerHTML.slice(0, 120)).toBe(true);
    }
  });
});

describe('FlipCard', () => {
  it('flips with Enter and Space and only exposes the visible face', async () => {
    const user = userEvent.setup();
    render(<FlipCard id="crane" />);
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

describe('Places', () => {
  it('updates the panel from the list and from the map with the keyboard', async () => {
    const user = userEvent.setup();
    render(<Places />);
    const list = screen.getByRole('heading', { name: 'Regions' }).nextElementSibling as HTMLElement;

    await user.click(within(list).getByRole('button', { name: 'Coasts and islands' }));
    expect(screen.getByRole('heading', { level: 3, name: 'Coasts and islands' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Meet the Sea turtle' })).toHaveAttribute('href', '#guardian-turtle');

    const map = screen.getByRole('group', { name: /pixel map of India/ });
    const mountains = within(map).getByRole('button', { name: 'High mountains' });
    mountains.focus();
    await user.keyboard('{Enter}');
    expect(mountains).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Guardian: Snow leopard')).toBeInTheDocument();
  });
});
