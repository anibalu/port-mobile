import React from 'react';

import TopBarDescription from './TopBarDescription';
import TopBarTitle from './TopBarTitle';

/**
 * TopBarEmptyTitleAndDescription component displays an empty title and description in the top bar.
 * It adapts its appearance based on the theme (light/dark).
 *
 * @param theme - The current theme (light/dark) to determine styling
 * @returns A themed title and description section with empty content
 */
const TopBarEmptyTitleAndDescription = ({theme}: {theme: 'light' | 'dark'}) => {
  return (
    <>
      <TopBarTitle theme={theme} />
      <TopBarDescription theme={theme} />
    </>
  );
};

export default TopBarEmptyTitleAndDescription;
