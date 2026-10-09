import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { createMemoryRouter, MemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { PRERENDER_PATHS, routes } from '../app/routes';
import '../i18n';
import en from '../i18n/en.json';
import hi from '../i18n/hi.json';
import { FlipCard, GUARDIANS } from '../pages/landing/sections/Guardians';
import { NAV } from '../pages/landing/sections/shared';
import { SplitCards } from '../pages/landing/sections/SplitCards';

type Tree = { [key: string]: string | Tree };

function leaves(tree: Tree, prefix = ''): Record<string, string> {
  return Object.entries(tree).reduce<Record<string, string>>((acc, [k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    return typeof v === 'string' ? { ...acc, [key]: v } : { ...acc, ...leaves(v, key) };
  }, {});
}

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return render(<RouterProvider router={router} />);
}

const inRouter = (ui: ReactNode) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('i18n bundles', () => {
  const enKeys = leaves(en);
  const hiKeys = leaves(hi);

  it('has the same keys in English and Hindi', () => {
    expect(Object.keys(hiKeys).sort()).toEqual(Object.keys(enKeys).sort());
  });

  it('has no empty strings and keeps interpolation variables and emphasis tags', () => {
    const tokens = (s: string) => (s.match(/\{\{\w+\}\}|<\/?[mug]>/g) ?? []).sort();
    for (const [key, value] of Object.entries(enKeys)) {
      expect(value.trim(), key).not.toBe('');
      expect(hiKeys[key]?.trim(), key).not.toBe('');
      expect(tokens(hiKeys[key] ?? ''), key).toEqual(tokens(value));
    }
  });
});

describe('Home page', () => {
  it('has one h1, a skip link and menu links that open pages', () => {
    const { container } = renderAt('/');
    expect(container.querySelectorAll('h1')).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#main');
    const hrefs = [...container.querySelectorAll('nav a')].map((a) => a.getAttribute('href'));
    for (const n of NAV) expect(hrefs).toContain(n.to);
  });

  it('gives every image an alt attribute and every svg a label or aria-hidden', () => {
    const { container } = renderAt('/');
    for (const img of container.querySelectorAll('img')) expect(img.hasAttribute('alt'), img.outerHTML.slice(0, 100)).toBe(true);
    for (const svg of container.querySelectorAll('svg')) {
      const labelled = (svg.getAttribute('role') === 'img' || svg.getAttribute('role') === 'group') && svg.hasAttribute('aria-label');
      const decorative = svg.closest('[aria-hidden="true"]') !== null;
      expect(labelled || decorative, svg.outerHTML.slice(0, 100)).toBe(true);
    }
  });

  it('renders emphasis tags as effects, never as raw markup', () => {
    const { container } = renderAt('/');
    expect(container.textContent).not.toMatch(/<\/?[mug]>/);
    expect(container.querySelector('.mark-marker')?.textContent).toBe('about a minute');
    expect(container.querySelector('.mark-scribble')).not.toBeNull();
    expect(container.querySelector('.mark-shimmer')).not.toBeNull();
  });

  it('steps through hero highlights with the carousel buttons', async () => {
    const user = userEvent.setup();
    renderAt('/');
    const highlights = screen.getByRole('complementary', { name: 'Highlights' });
    expect(within(highlights).getByText('Your first day takes about a minute')).toBeInTheDocument();
    await user.click(within(highlights).getByRole('button', { name: 'Pause highlights' }));
    await user.click(within(highlights).getByRole('button', { name: 'Next highlight' }));
    expect(await within(highlights).findByText('Six guardians are waiting to wake up')).toBeInTheDocument();
  });

  it('links the pills and section buttons to their pages', () => {
    renderAt('/');
    expect(screen.getByRole('link', { name: /Oru in numbers/ })).toHaveAttribute('href', '/impact');
    expect(screen.getByRole('link', { name: /What comes next/ })).toHaveAttribute('href', '/roadmap');
    expect(screen.getByRole('link', { name: /See all guardians/ })).toHaveAttribute('href', '/guardians');
    expect(screen.getByRole('link', { name: /Read about the Sarus crane/ })).toHaveAttribute('href', '/guardians/crane');
  });
});

describe('Pages', () => {
  it.each(PRERENDER_PATHS.filter((p) => p !== '/'))('%s renders a single page heading', (path) => {
    const { container } = renderAt(path);
    expect(container.querySelectorAll('h1')).toHaveLength(1);
  });

  it('shows the guardian page for a known id and the not-found page otherwise', () => {
    renderAt('/guardians/dolphin');
    expect(screen.getByRole('heading', { level: 1, name: 'River dolphin' })).toBeInTheDocument();
    expect(screen.getByText(/finds its way and its food in muddy water/)).toBeInTheDocument();
  });

  it('shows the not-found page for unknown URLs', () => {
    renderAt('/no-such-page');
    expect(screen.getByRole('heading', { level: 1, name: 'This page wandered off' })).toBeInTheDocument();
  });

  it('shows the not-found page for an unknown guardian', () => {
    renderAt('/guardians/unicorn');
    expect(screen.getByRole('heading', { level: 1, name: 'This page wandered off' })).toBeInTheDocument();
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
    inRouter(<SplitCards />);
    const places = document.getElementById('places') as HTMLElement;
    const list = within(places).getByRole('heading', { name: 'Regions' }).nextElementSibling as HTMLElement;

    await user.click(within(list).getByRole('button', { name: 'Coasts and islands' }));
    expect(within(places).getByRole('heading', { level: 3, name: 'Coasts and islands' })).toBeInTheDocument();
    expect(within(places).getByRole('link', { name: 'Meet the Sea turtle' })).toHaveAttribute('href', '/guardians/turtle');

    const map = within(places).getByRole('group', { name: /pixel map of India/ });
    const mountains = within(map).getByRole('button', { name: 'High mountains' });
    mountains.focus();
    await user.keyboard('{Enter}');
    expect(mountains).toHaveAttribute('aria-pressed', 'true');
    expect(within(places).getByText('Guardian: Snow leopard')).toBeInTheDocument();
  });

  it('lets people pick a growth stage', async () => {
    const user = userEvent.setup();
    inRouter(<SplitCards />);
    const growth = document.getElementById('growth') as HTMLElement;
    const forest = within(growth).getByRole('button', { name: 'Forest' });
    await user.click(forest);
    expect(forest).toHaveAttribute('aria-pressed', 'true');
    expect(within(growth).getByText(/your plot is a small green city/)).toBeInTheDocument();
  });

  it('has a Learn more link to each section page', () => {
    inRouter(<SplitCards />);
    const hrefs = screen.getAllByRole('link', { name: /Learn more/ }).map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(['/how-it-works', '/grow', '/places']);
  });
});
