import type { ComponentPropsWithoutRef } from 'react';
import { classNames } from '@junipero/react';
import { CursorArrowIcon, PlusIcon } from '@radix-ui/react-icons';
import { Card, DropdownMenu, IconButton } from '@radix-ui/themes';

import { useCanvas } from '../hooks';

export interface ToolbarProps extends ComponentPropsWithoutRef<'div'> {}

const Toolbar = ({ className, ...props }: ToolbarProps) => {
  const { tool } = useCanvas();

  return (
    <Card
      size="2"
      className={classNames(
        'flex items-center !bg-seashell dark:!bg-onyx !p-3',
        className
      )}
      { ...props }
    >
      <IconButton
        className="!m-0"
        size="2"
        variant={tool === 'move' ? 'solid' : 'ghost'}
      >
        <CursorArrowIcon
          width={20}
          height={20}
          className="fill-onyx dark:fill-seashell"
        />
      </IconButton>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <IconButton
            className="!m-0 !ml-2"
            size="2"
            variant={tool === 'add' ? 'solid' : 'ghost'}
          >
            <PlusIcon
              width={20}
              height={20}
              className="[&_path]:fill-onyx dark:[&_path]:fill-seashell"
            />
          </IconButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content sideOffset={20} align="center">
          <DropdownMenu.Item>Sensor</DropdownMenu.Item>
          <DropdownMenu.Item>Actor</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </Card>
  );
};

export default Toolbar;
