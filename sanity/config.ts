// sanity/config.ts

// --- INSTRUCTIONS ---
// 1. Find your Sanity Project ID and Dataset name.
//    You can find these in your Sanity project's `sanity.config.ts` file
//    or by visiting https://www.sanity.io/manage.
//
// 2. Replace the placeholder values below with your actual credentials.

export const sanityConfig = {
  /**
   * Your Sanity project's unique identifier.
   * @example '_a1b2c3d4'
   */
  projectId: 'rdu1jgnq', // 👈 Replace this string

  /**
   * The name of the dataset you want to connect to.
   * This is typically 'production' unless you've configured otherwise.
   */
  dataset: 'production',
};
