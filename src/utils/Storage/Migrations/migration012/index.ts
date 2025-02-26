import addCallingPermission from './addCallingPermission';

export default async function migration012() {
  await addCallingPermission();
}
