export {};

declare global {
  var authUser: {
    email: string;
    username: string;
    full_name: string;
  } | null;
}
