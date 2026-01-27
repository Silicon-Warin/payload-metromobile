import * as migration_20260105_201500_initial from './20260105_201500_initial';
import * as migration_20260127_140741_add_slides_to_popup_banner from './20260127_140741_add_slides_to_popup_banner';
import * as migration_20260127_204216 from './20260127_204216';

export const migrations = [
  {
    up: migration_20260105_201500_initial.up,
    down: migration_20260105_201500_initial.down,
    name: '20260105_201500_initial',
  },
  {
    up: migration_20260127_140741_add_slides_to_popup_banner.up,
    down: migration_20260127_140741_add_slides_to_popup_banner.down,
    name: '20260127_140741_add_slides_to_popup_banner',
  },
  {
    up: migration_20260127_204216.up,
    down: migration_20260127_204216.down,
    name: '20260127_204216'
  },
];
