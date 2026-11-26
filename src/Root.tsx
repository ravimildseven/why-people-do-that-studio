import React from 'react';
import {Composition} from 'remotion';
import {S01Bedtime, S01_DURATION} from './shorts/S01Bedtime';
import {S01v2Bedtime, S01V2_DURATION} from './shorts/S01v2Bedtime';
import {S01v3Bedtime, S01V3_DURATION} from './shorts/S01v3Bedtime';
import {useChannelFonts} from './kit/Overlays';

const WithFonts: React.FC<{C: React.FC}> = ({C}) => {
  useChannelFonts();
  return <C />;
};
const S01 = () => <WithFonts C={S01Bedtime} />;
const S01v2 = () => <WithFonts C={S01v2Bedtime} />;
const S01v3 = () => <WithFonts C={S01v3Bedtime} />;

export const Root: React.FC = () => (
  <>
    <Composition id="S01v3-Bedtime" component={S01v3} durationInFrames={S01V3_DURATION} fps={30} width={1080} height={1920} />
    <Composition id="S01v2-Bedtime" component={S01v2} durationInFrames={S01V2_DURATION} fps={30} width={1080} height={1920} />
    <Composition id="S01-Bedtime" component={S01} durationInFrames={S01_DURATION} fps={30} width={1080} height={1920} />
  </>
);
