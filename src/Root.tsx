import React from 'react';
import {Composition} from 'remotion';
import {S01Bedtime, S01_DURATION} from './shorts/S01Bedtime';
import {S02Yawns, S02_DURATION} from './shorts/S02Yawns';
import {useChannelFonts} from './kit/Overlays';

const WithFonts: React.FC<{C: React.FC}> = ({C}) => {
  useChannelFonts();
  return <C />;
};
const S01 = () => <WithFonts C={S01Bedtime} />;
const S02 = () => <WithFonts C={S02Yawns} />;

export const Root: React.FC = () => (
  <>
    <Composition id="S01-Bedtime" component={S01} durationInFrames={S01_DURATION} fps={30} width={1080} height={1920} />
    <Composition id="S02-Yawns" component={S02} durationInFrames={S02_DURATION} fps={30} width={1080} height={1920} />
  </>
);
