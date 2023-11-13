import {
  DirectConnectionBundle,
  GeneratedDirectConnectionBundle,
  GeneratedDirectSuperportConnectionBundle,
} from '../Bundles/interfaces';
import {
  getGeneratedBundlesRNFS,
  getGeneratedSuperportBundlesRNFS,
  getReadBundlesRNFS,
  saveGeneratedBundlesRNFS,
  saveGeneratedSuperportBundlesRNFS,
  saveReadBundlesRNFS,
} from './StorageRNFS/bundlesHandlers';

/**
 * saves read bundles to storage.
 * @param {DirectConnectionBundle[]} bundles - read bundle to save
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 */
export async function saveReadDirectConnectionBundles(
  bundles: DirectConnectionBundle[],
  blocking: boolean = false,
) {
  saveReadBundlesRNFS(bundles, blocking);
}

/**
 * saves generated bundles to storage.
 * @param {GeneratedDirectConnectionBundle[]} bundles - generated bundles to save
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 */
export async function saveGeneratedDirectConnectionBundles(
  bundles: GeneratedDirectConnectionBundle[],
  blocking: boolean = false,
) {
  saveGeneratedBundlesRNFS(bundles, blocking);
}

export async function saveGeneratedSuperportDirectConnectionBundles(
  bundles: GeneratedDirectSuperportConnectionBundle[],
  blocking: boolean = false,
) {
  saveGeneratedSuperportBundlesRNFS(bundles, blocking);
}

/**
 * reads read bundles in storage
 * @param {boolean} blocking - whether the function should block operations until completed. default = false
 * @returns {DirectConnectionBundle[]} - bundles in storage.
 */
export async function getReadDirectConnectionBundles(
  blocking: boolean = false,
): Promise<DirectConnectionBundle[]> {
  return await getReadBundlesRNFS(blocking);
}

/**
 * reads generated bundles in storage
 * @param {boolean} blocking - whether the function should block operations until completed. default = false
 * @returns {GeneratedDirectConnectionBundle[]} - bundles in storage.
 */
export async function getGeneratedDirectConnectionBundles(
  blocking: boolean = false,
): Promise<GeneratedDirectConnectionBundle[]> {
  return await getGeneratedBundlesRNFS(blocking);
}

export async function getGeneratedSuperportDirectConnectionBundles(
  blocking: boolean = false,
): Promise<GeneratedDirectSuperportConnectionBundle[]> {
  return await getGeneratedSuperportBundlesRNFS(blocking);
}
