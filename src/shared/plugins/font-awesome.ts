import { Plugin } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library, IconDefinition } from '@fortawesome/fontawesome-svg-core';

import {
  faBell,
  faUser,
  faFire,
  faAngleDown,
  faAngleRight,
  faAngleDoubleRight,
  faBoxes,
  faBars,
  faSlidersH,
  faSearch,
  faCubes,
  faBinoculars,
  faCircleNotch,
  faCamera,
  faSync,
  faCheck,
  faFrown,
  faSpinner,
  faExclamationTriangle,
  faGlassCheers,
  faPlusCircle,
  faTrash,
  faPalette,
  faThumbsUp,
  faUpload,
  faArrowsUpDownLeftRight,
  faMagnifyingGlass,
  faMagnifyingGlassMinus,
  faMagnifyingGlassPlus,
  faRotateLeft,
  faRotateRight,
  faArrowsLeftRightToLine,
  faMaximize,
  faMinimize,
  faPenToSquare,
  faCircleXmark,
  faGear,
  faTableCells,
  faCropSimple,
  faCrosshairs,
  faCloudArrowUp,
  faCircleCheck,
  faImage,
  faVideo,
  faList,
  faThList,
  faRecycle,
  faInfoCircle,
  faX,
  faMinusCircle,
  faEnvelope,
  faStar,
  faStarHalf,
  faEye,
  faArrowUp,
  faArrowRightArrowLeft,
  faHourglassStart,
  faBullseye,
  faArrowsV,
  faCode,
  faFont,
  faSquare,
  faLock,
  faBuilding,
} from '@fortawesome/free-solid-svg-icons';

library.add(faBell as IconDefinition);
library.add(faUser as IconDefinition);
library.add(faFire as IconDefinition);
library.add(faAngleDown as IconDefinition);
library.add(faAngleRight as IconDefinition);
library.add(faAngleDoubleRight as IconDefinition);
library.add(faBoxes as IconDefinition);
library.add(faBars as IconDefinition);
library.add(faSlidersH as IconDefinition);
library.add(faSearch as IconDefinition);
library.add(faCubes as IconDefinition);
library.add(faBinoculars as IconDefinition);
library.add(faCircleNotch as IconDefinition);
library.add(faCamera as IconDefinition);
library.add(faSync as IconDefinition);
library.add(faCheck as IconDefinition);
library.add(faFrown as IconDefinition);
library.add(faSpinner as IconDefinition);
library.add(faExclamationTriangle as IconDefinition);
library.add(faGlassCheers as IconDefinition);
library.add(faPlusCircle as IconDefinition);
library.add(faTrash as IconDefinition);
library.add(faPalette as IconDefinition);
library.add(faThumbsUp as IconDefinition);
library.add(faUpload as IconDefinition);
library.add(faArrowsUpDownLeftRight as IconDefinition);
library.add(faMagnifyingGlass as IconDefinition);
library.add(faMagnifyingGlassMinus as IconDefinition);
library.add(faMagnifyingGlassPlus as IconDefinition);
library.add(faRotateLeft as IconDefinition);
library.add(faRotateRight as IconDefinition);
library.add(faArrowsLeftRightToLine as IconDefinition);
library.add(faMaximize as IconDefinition);
library.add(faMinimize as IconDefinition);
library.add(faPenToSquare as IconDefinition);
library.add(faCircleXmark as IconDefinition);
library.add(faGear as IconDefinition);
library.add(faTableCells as IconDefinition);
library.add(faCropSimple as IconDefinition);
library.add(faCrosshairs as IconDefinition);
library.add(faCloudArrowUp as IconDefinition);
library.add(faCircleCheck as IconDefinition);
library.add(faImage as IconDefinition);
library.add(faVideo as IconDefinition);
library.add(faList as IconDefinition);
library.add(faThList as IconDefinition);
library.add(faRecycle as IconDefinition);
library.add(faInfoCircle as IconDefinition);
library.add(faX as IconDefinition);
library.add(faMinusCircle as IconDefinition);
library.add(faEnvelope as IconDefinition);
library.add(faHourglassStart as IconDefinition);
library.add(faStar as IconDefinition);
library.add(faStarHalf as IconDefinition);
library.add(faEye as IconDefinition);
library.add(faArrowUp as IconDefinition);
library.add(faArrowRightArrowLeft as IconDefinition);
library.add(faBullseye as IconDefinition);
library.add(faArrowsV as IconDefinition);
library.add(faCode as IconDefinition);
library.add(faFont as IconDefinition);
library.add(faSquare as IconDefinition);
library.add(faLock as IconDefinition);
library.add(faBuilding as IconDefinition);

export default {
  install(app) {
    app.component('FontAwesomeIcon', FontAwesomeIcon);
  },
} as Plugin;
