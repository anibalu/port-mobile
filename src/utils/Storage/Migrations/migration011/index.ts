import addFavouriteFolderPermission from './addFavouriteFolderPermission';

export default async function migration011() {
  await addFavouriteFolderPermission();
}
