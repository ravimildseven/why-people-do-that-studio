import React from 'react';
import {Composition} from 'remotion';
import {S01Bedtime, S01_DURATION} from './shorts/S01Bedtime';
import {useChannelFonts} from './kit/Overlays';

const WithFonts: React.FC<{C: React.FC}> = ({C}) => {
  useChannelFonts();
  return <C />;
};
const S01 = () => <WithFonts C={S01Bedtime} />;

export const Root: React.FC = () => (
  <>
    <Composition id="S01-Bedtime" component={S01} durationInFrames={S01_DURATION} fps={30} width={1080} height={1920} />
  </>
);
