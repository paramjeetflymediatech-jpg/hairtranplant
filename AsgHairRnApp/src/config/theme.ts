/**
 * ASG Hair Transplant — App Theme
 * Colors extracted from the official logo:
 *   Primary gradient: Deep Red #C23500 → Vibrant Orange #FF6929
 *   Accent gold:      #E8A020
 *   Background:       #FFF8F5 (warm off-white)
 *   Dark text:        #1A0A00
 *   Muted text:       #7A4A30
 */

export const THEME = {
  // ── Brand gradient endpoints
  primary:        '#D63900',   // deep red (logo top-left)
  primaryLight:   '#FF6929',   // vivid orange (logo bottom-right)
  accent:         '#E8A020',   // gold (the "G" letter)

  // ── Surfaces
  bg:             '#FFF8F5',   // warm white page background
  card:           '#FFFFFF',
  cardBorder:     '#FFE0CC',
  headerBg:       '#C23500',   // rich deep red for nav bars

  // ── Text
  textPrimary:    '#1A0A00',   // near-black with red warmth
  textSecondary:  '#7A4A30',   // muted brown-red
  textOnDark:     '#FFFFFF',
  textAccent:     '#E8A020',   // gold accent text

  // ── States
  disabled:       '#F0D5C8',
  disabledText:   '#C0937A',
  badge:          'rgba(214,57,0,0.10)',
  badgeText:      '#D63900',

  // ── Drawer
  drawerBg:       '#1A0A00',
  drawerBorder:   'rgba(255,105,41,0.12)',
  drawerActive:   'rgba(255,105,41,0.15)',
  drawerText:     '#C0937A',
  drawerTextActive: '#FF6929',

  // ── Pagination dots
  dotInactive:    '#FFD0B0',
  dotActive:      '#D63900',
};
