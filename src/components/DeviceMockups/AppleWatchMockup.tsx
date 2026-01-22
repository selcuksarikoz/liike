import { DEVICES } from '../../constants/devices';
import { GenericDeviceMockup, DeviceMockupProps } from './GenericDeviceMockup';

export const AppleWatchMockup = (props: DeviceMockupProps) => {
  const config = DEVICES.find(d => d.id === 'watch-ultra');
  return <GenericDeviceMockup config={config} {...props} />;
};
