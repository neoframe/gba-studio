import { classNames } from '@junipero/react';
import { Card } from '@radix-ui/themes';

const Sidebar = () => {

  return (
    <Card
      className={classNames(
        'w-full h-full bg-seashell dark:bg-onyx',
        'before:!rounded-none after:!rounded-none !rounded-none',
      )}
    >
      Sidebar
    </Card>
  );
};

export default Sidebar;
