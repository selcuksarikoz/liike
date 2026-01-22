import { DEVICES } from '../../constants/devices';
import { GenericDeviceMockup, DeviceMockupProps } from './GenericDeviceMockup';

export const MacbookMockup = (props: DeviceMockupProps) => {
  const config = DEVICES.find(d => d.id === 'macbook-pro-16');
  return <GenericDeviceMockup config={config} {...props} />;
};
