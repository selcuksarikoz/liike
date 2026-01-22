import { DEVICES } from '../../constants/devices';
import { GenericDeviceMockup, DeviceMockupProps } from './GenericDeviceMockup';

export const IpadMockup = (props: DeviceMockupProps) => {
  const config = DEVICES.find(d => d.id === 'ipad-pro-12-p');
  return <GenericDeviceMockup config={config} {...props} />;
};
