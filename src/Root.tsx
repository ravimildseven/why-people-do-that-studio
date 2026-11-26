import React from 'react';
import {Composition} from 'remotion';
import {S01Bedtime, S01_DURATION} from './shorts/S01Bedtime';
import {S01v2Bedtime, S01V2_DURATION} from './shorts/S01v2Bedtime';
import {S01v3Bedtime, S01V3_DURATION} from './shorts/S01v3Bedtime';
import {KineticStyle} from './kinetic/StyleFrames';
import {S01v4Kinetic, S01V4_DURATION} from './shorts/S01v4Kinetic';
import {S02Names, S02_DURATION} from './shorts/S02Names';
import {useChannelFonts} from './kit/Overlays';

const WithFonts: React.FC<{C: React.FC}> = ({C}) => {
  useChannelFonts();
  return <C />;
};
const S01 = () => <WithFonts C={S01Bedtime} />;
const S01v2 = () => <WithFonts C={S01v2Bedtime} />;
const S01v3 = () => <WithFonts C={S01v3Bedtime} />;
const KStyle = () => <WithFonts C={KineticStyle} />;
const S01v4 = () => <WithFonts C={S01v4Kinetic} />;
const S02 = () => <WithFonts C={S02Names} />;

export const Root: React.FC = () => (
  <>
    <Composition id="S02-Names" component={S02} durationInFrames={S02_DURATION} fps={30} width={1080} height={1920} />
    <Composition id="S01v4-Kinetic" component={S01v4} durationInFrames={S01V4_DURATION} fps={30} width={1080} height={1920} />
    <Composition id="KineticStyle" component={KStyle} durationInFrames={6} fps={30} width={1080} height={1920} />
    <Composition id="S01v3-Bedtime" component={S01v3} durationInFrames={S01V3_DURATION} fps={30} width={1080} height={1920} />
    <Composition id="S01v2-Bedtime" component={S01v2} durationInFrames={S01V2_DURATION} fps={30} width={1080} height={1920} />
    <Composition id="S01-Bedtime" component={S01} durationInFrames={S01_DURATION} fps={30} width={1080} height={1920} />
  </>
);
