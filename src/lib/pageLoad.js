import { uid } from './time'

/** Unique per page load. A focus block tagged with a different id was interrupted by a reload or app close. */
export const PAGE_LOAD_ID = uid()
