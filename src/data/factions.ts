import type { Faction } from '../game/types';

export const factions: Faction[] = [
  // ─── ÉQUIPE 1 ──────────────────────────────────────────────────────────────
  {
    id: 1,
    name: 'Équipe 1 — Les Éclaireurs',
    description:
      'Maîtres des diagonales et de la mobilité centrale. Leurs éclaireurs frappent en arc, leurs gardes couvrent les flancs, et leur renne commande de près.',
    color: '#e63946',
    pieces: [
      {
        type: 'pawn',
        pattern: {
          targets: [
            { dx: -1, dy: -1 },
            { dx:  1, dy: -1 },
          ],
        },
      },
      {
        type: 'inter1',
        pattern: {
          targets: [
            { dx: -1, dy: -1 },
            { dx:  1, dy: -1 },
            { dx: -2, dy:  1 },
            { dx:  2, dy:  1 },
          ],
        },
      },
      {
        type: 'inter2',
        // Star pattern: jump over adjacent cells to reach ring of radius ~2
        pattern: {
          targets: [
            { dx: -1, dy: -2, intermediates: [{ dx: 0, dy: -1, kind: 'flyover' }] },
            { dx:  1, dy: -2, intermediates: [{ dx: 0, dy: -1, kind: 'flyover' }] },
            { dx: -2, dy: -1, intermediates: [{ dx: -1, dy: 0, kind: 'flyover' }] },
            { dx:  2, dy: -1, intermediates: [{ dx:  1, dy: 0, kind: 'flyover' }] },
            { dx: -2, dy:  1, intermediates: [{ dx: -1, dy: 0, kind: 'flyover' }] },
            { dx:  2, dy:  1, intermediates: [{ dx:  1, dy: 0, kind: 'flyover' }] },
            { dx: -1, dy:  2, intermediates: [{ dx: 0, dy:  1, kind: 'flyover' }] },
            { dx:  1, dy:  2, intermediates: [{ dx: 0, dy:  1, kind: 'flyover' }] },
          ],
        },
      },
      {
        type: 'inter3',
        // Orthogonal cross, 2 cells range, blocking intermediates
        pattern: {
          targets: [
            { dx: 0, dy: -1 },
            { dx: 0, dy: -2, intermediates: [{ dx: 0, dy: -1, kind: 'blocking' }] },
            { dx: 0, dy:  1 },
            { dx: 0, dy:  2, intermediates: [{ dx: 0, dy:  1, kind: 'blocking' }] },
            { dx: -1, dy: 0 },
            { dx: -2, dy: 0, intermediates: [{ dx: -1, dy: 0, kind: 'blocking' }] },
            { dx:  1, dy: 0 },
            { dx:  2, dy: 0, intermediates: [{ dx:  1, dy: 0, kind: 'blocking' }] },
          ],
        },
      },
      {
        type: 'king',
        fbxUrl: '/character.fbx',
        pattern: {
          targets: [
            { dx: -1, dy: -1 }, { dx: 0, dy: -1 }, { dx: 1, dy: -1 },
            { dx: -1, dy:  0 },                     { dx: 1, dy:  0 },
            { dx: -1, dy:  1 }, { dx: 0, dy:  1 }, { dx: 1, dy:  1 },
          ],
        },
      },
    ],
  },

  // ─── ÉQUIPE 2 ──────────────────────────────────────────────────────────────
  {
    id: 2,
    name: 'Équipe 2 — Les Sentinelles',
    description:
      'Experts du contrôle de terrain. Leurs lances traversent les lignes, leurs défenseurs tiennent les flancs, et leurs archers frappent en X sur de longues portées.',
    color: '#457b9d',
    pieces: [
      {
        type: 'pawn',
        pattern: {
          targets: [
            { dx: -1, dy: -1 },
            { dx:  1, dy: -1 },
          ],
        },
      },
      {
        type: 'inter1',
        // Large cross: can flyover intermediates, acts on extremities + adjacent lateral
        pattern: {
          targets: [
            // Forward branch
            { dx: 0, dy: -1 },
            { dx: 0, dy: -2, intermediates: [{ dx: 0, dy: -1, kind: 'flyover' }] },
            { dx: 0, dy: -3, intermediates: [{ dx: 0, dy: -1, kind: 'flyover' }, { dx: 0, dy: -2, kind: 'flyover' }] },
            // Backward branch
            { dx: 0, dy:  1 },
            { dx: 0, dy:  2, intermediates: [{ dx: 0, dy:  1, kind: 'flyover' }] },
            { dx: 0, dy:  3, intermediates: [{ dx: 0, dy:  1, kind: 'flyover' }, { dx: 0, dy:  2, kind: 'flyover' }] },
            // Lateral: adjacent
            { dx: -1, dy: 0 },
            { dx:  1, dy: 0 },
            // Lateral extremities (flyover)
            { dx: -3, dy: 0, intermediates: [{ dx: -1, dy: 0, kind: 'flyover' }, { dx: -2, dy: 0, kind: 'flyover' }] },
            { dx:  3, dy: 0, intermediates: [{ dx:  1, dy: 0, kind: 'flyover' }, { dx:  2, dy: 0, kind: 'flyover' }] },
          ],
        },
      },
      {
        type: 'inter2',
        // Horizontal line 2 cells + 1 step straight forward
        pattern: {
          targets: [
            { dx: -1, dy: 0 },
            { dx: -2, dy: 0, intermediates: [{ dx: -1, dy: 0, kind: 'blocking' }] },
            { dx:  1, dy: 0 },
            { dx:  2, dy: 0, intermediates: [{ dx:  1, dy: 0, kind: 'blocking' }] },
            { dx:  0, dy: -1 },
          ],
        },
      },
      {
        type: 'inter3',
        // Grand X (diagonals), 2 cells, blocking
        pattern: {
          targets: [
            { dx: -1, dy: -1 },
            { dx: -2, dy: -2, intermediates: [{ dx: -1, dy: -1, kind: 'blocking' }] },
            { dx:  1, dy: -1 },
            { dx:  2, dy: -2, intermediates: [{ dx:  1, dy: -1, kind: 'blocking' }] },
            { dx: -1, dy:  1 },
            { dx: -2, dy:  2, intermediates: [{ dx: -1, dy:  1, kind: 'blocking' }] },
            { dx:  1, dy:  1 },
            { dx:  2, dy:  2, intermediates: [{ dx:  1, dy:  1, kind: 'blocking' }] },
          ],
        },
      },
      {
        type: 'king',
        pattern: {
          targets: [
            { dx: -1, dy: -1 }, { dx: 0, dy: -1 }, { dx: 1, dy: -1 },
            { dx: -1, dy:  0 },                     { dx: 1, dy:  0 },
            { dx: -1, dy:  1 }, { dx: 0, dy:  1 }, { dx: 1, dy:  1 },
          ],
        },
      },
    ],
  },

  // ─── ÉQUIPE 3 ──────────────────────────────────────────────────────────────
  {
    id: 3,
    name: 'Équipe 3 — Les Ombres',
    description:
      'Tactiques en fourche et projection en Y. Leurs pièces dessinent des formes asymétriques qui déstabilisent l\'adversaire et créent des angles inattendus.',
    color: '#2d6a4f',
    pieces: [
      {
        type: 'pawn',
        pattern: {
          targets: [
            { dx: -1, dy: -1 },
            { dx:  1, dy: -1 },
          ],
        },
      },
      {
        type: 'inter1',
        // Y shape: two diagonals forward + one cell straight ahead (far) + one back
        pattern: {
          targets: [
            { dx: -1, dy: -1 },
            { dx:  1, dy: -1 },
            { dx:  0, dy: -2, intermediates: [{ dx: 0, dy: -1, kind: 'blocking' }] },
            { dx:  0, dy:  2, intermediates: [{ dx: 0, dy:  1, kind: 'blocking' }] },
          ],
        },
      },
      {
        type: 'inter2',
        // T / fan: horizontal line (2 cells each side) + two forward diagonals
        pattern: {
          targets: [
            { dx: -1, dy:  0 },
            { dx: -2, dy:  0, intermediates: [{ dx: -1, dy: 0, kind: 'blocking' }] },
            { dx:  1, dy:  0 },
            { dx:  2, dy:  0, intermediates: [{ dx:  1, dy: 0, kind: 'blocking' }] },
            { dx: -1, dy: -1 },
            { dx:  1, dy: -1 },
          ],
        },
      },
      {
        type: 'inter3',
        // Double vertical column forward: two parallel towers + one back
        pattern: {
          targets: [
            { dx: -1, dy: -1 },
            { dx: -1, dy: -2, intermediates: [{ dx: -1, dy: -1, kind: 'blocking' }] },
            { dx:  1, dy: -1 },
            { dx:  1, dy: -2, intermediates: [{ dx:  1, dy: -1, kind: 'blocking' }] },
            { dx:  0, dy:  1 },
          ],
        },
      },
      {
        type: 'king',
        pattern: {
          targets: [
            { dx: -1, dy: -1 }, { dx: 0, dy: -1 }, { dx: 1, dy: -1 },
            { dx: -1, dy:  0 },                     { dx: 1, dy:  0 },
            { dx: -1, dy:  1 }, { dx: 0, dy:  1 }, { dx: 1, dy:  1 },
          ],
        },
      },
    ],
  },

  // ─── ÉQUIPE 4 ──────────────────────────────────────────────────────────────
  {
    id: 4,
    name: 'Équipe 4 — Les Forgeurs',
    description:
      'Maîtres des longues lignes et des angles brisés. Leurs armes glissent loin sur les rangées, tandis que leurs éclaireurs ouvrent des angles en Z imprévus.',
    color: '#e9c46a',
    pieces: [
      {
        type: 'pawn',
        imageUrl: '/pieces/forgeur-pawn.png',
        pattern: {
          targets: [
            { dx: -1, dy: -1 },
            { dx:  1, dy: -1 },
          ],
        },
      },
      {
        type: 'inter1',
        imageUrl: '/pieces/forgeur-inter1.png',
        // Wide V: two close diagonals + two far diagonals (blocking)
        pattern: {
          targets: [
            { dx: -1, dy: -1 },
            { dx:  1, dy: -1 },
            { dx: -2, dy: -2, intermediates: [{ dx: -1, dy: -1, kind: 'blocking' }] },
            { dx:  2, dy: -2, intermediates: [{ dx:  1, dy: -1, kind: 'blocking' }] },
          ],
        },
      },
      {
        type: 'inter2',
        imageUrl: '/pieces/forgeur-inter2.png',
        // Long horizontal line: 3 cells each side, sliding (blocking)
        pattern: {
          targets: [
            { dx: -1, dy: 0 },
            { dx: -2, dy: 0, intermediates: [{ dx: -1, dy: 0, kind: 'blocking' }] },
            { dx: -3, dy: 0, intermediates: [{ dx: -1, dy: 0, kind: 'blocking' }, { dx: -2, dy: 0, kind: 'blocking' }] },
            { dx:  1, dy: 0 },
            { dx:  2, dy: 0, intermediates: [{ dx:  1, dy: 0, kind: 'blocking' }] },
            { dx:  3, dy: 0, intermediates: [{ dx:  1, dy: 0, kind: 'blocking' }, { dx:  2, dy: 0, kind: 'blocking' }] },
          ],
        },
      },
      {
        type: 'inter3',
        imageUrl: '/pieces/forgeur-inter3.png',
        // Z / broken diagonal: 4 diagonal + 2 vertical far
        pattern: {
          targets: [
            { dx: -1, dy: -1 },
            { dx:  1, dy: -1 },
            { dx: -1, dy:  1 },
            { dx:  1, dy:  1 },
            { dx:  0, dy: -2, intermediates: [{ dx: 0, dy: -1, kind: 'blocking' }] },
            { dx:  0, dy:  2, intermediates: [{ dx: 0, dy:  1, kind: 'blocking' }] },
          ],
        },
      },
      {
        type: 'king',
        pattern: {
          targets: [
            { dx: -1, dy: -1 }, { dx: 0, dy: -1 }, { dx: 1, dy: -1 },
            { dx: -1, dy:  0 },                     { dx: 1, dy:  0 },
            { dx: -1, dy:  1 }, { dx: 0, dy:  1 }, { dx: 1, dy:  1 },
          ],
        },
      },
    ],
  },
];
