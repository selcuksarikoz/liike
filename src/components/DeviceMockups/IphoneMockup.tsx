import { DEVICES } from '../../constants/devices';
import { GenericDeviceMockup, DeviceMockupProps } from './GenericDeviceMockup';

export const IphoneMockup = (props: DeviceMockupProps) => {
  const config = DEVICES.find(d => d.id === 'iphone-16-pro');
  return <GenericDeviceMockup config={config} {...props} />;
};
