import { DEVICES } from '../../constants/devices';
import { GenericDeviceMockup, DeviceMockupProps } from './GenericDeviceMockup';

export const ImacMockup = (props: DeviceMockupProps) => {
  const config = DEVICES.find(d => d.id === 'imac-24');
  return <GenericDeviceMockup config={config} {...props} />;
};
