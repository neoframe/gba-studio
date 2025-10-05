import { Separator, Text } from '@radix-ui/themes';
import { ToggleGroup } from 'radix-ui';
import { classNames, set } from '@junipero/react';
import {
  TriangleDownIcon,
  TriangleLeftIcon,
  TriangleRightIcon,
  TriangleUpIcon,
} from '@radix-ui/react-icons';

import type { WaitForButtonEvent } from '../../../types';

export interface EventButtonsProps {
  event: WaitForButtonEvent;
  onValueChange?: (event: WaitForButtonEvent) => void;
}

const EventButtons = ({
  event,
  onValueChange,
}: EventButtonsProps) => {
  const onValueChange_ = (name: string, value: any) => {
    set(event, name, value);
    onValueChange?.(event);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Text size="1" className="text-slate">Buttons</Text>
        <ToggleGroup.Root
          value={event.buttons}
          onValueChange={onValueChange_.bind(null, 'buttons')}
          type="multiple"
          className={classNames(
            // Parent
            'rounded-sm bg-(--gray-a2) h-(--space-6) flex items-center',
            // Children
            '[&_button]:h-full',
            '[&_button]:flex-auto [&_button]:flex [&_button]:items-center',
            '[&_button]:justify-center [&_button]:hover:bg-(--gray-a2)',
            '[&_button]:text-xs [&_button]:rounded-sm [&_button]:relative',
            '[&_button]:data-[state=on]:bg-(--gray-a3)',
            '[&_button]:relative [&_button]:z-1',
            // eslint-disable-next-line @stylistic/max-len
            '[&_button]:data-[state=on]:shadow-[inset_0_0_0_1px_var(--gray-a2)]',
            '[&_button]:data-[state=on]:[&_+_.rt-Separator]:opacity-0',
            // Separators
            '[&_.rt-Separator]:has-[+_button[data-state=on]]:opacity-0',
            '[&_.rt-Separator]:flex-none [&_.rt-Separator]:!h-[calc(100%-6px)]',
            '[&_.rt-Separator]:relative [&_.rt-Separator]:z-0',
            '[&_.rt-Separator]:!bg-(--gray-a3)',
            '[&_.rt-Separator]:transition-opacity',
            '[&_.rt-Separator]:duration-200',
          )}
        >
          <ToggleGroup.Item value="A">A</ToggleGroup.Item>
          <Separator orientation="vertical" />
          <ToggleGroup.Item value="B">B</ToggleGroup.Item>
          <Separator orientation="vertical" />
          <ToggleGroup.Item value="Start">Start</ToggleGroup.Item>
          <Separator orientation="vertical" />
          <ToggleGroup.Item value="Select">Select</ToggleGroup.Item>
          <Separator orientation="vertical" />
          <ToggleGroup.Item value="Down"><TriangleDownIcon /></ToggleGroup.Item>
          <Separator orientation="vertical" />
          <ToggleGroup.Item value="Left"><TriangleLeftIcon /></ToggleGroup.Item>
          <Separator orientation="vertical" />
          <ToggleGroup.Item value="Up"><TriangleUpIcon /></ToggleGroup.Item>
          <Separator orientation="vertical" />
          <ToggleGroup.Item value="Right">
            <TriangleRightIcon />
          </ToggleGroup.Item>
          <Separator orientation="vertical" />
          <ToggleGroup.Item value="L">L</ToggleGroup.Item>
          <Separator orientation="vertical" />
          <ToggleGroup.Item value="R">R</ToggleGroup.Item>
        </ToggleGroup.Root>
      </div>
    </div>
  );
};

export default EventButtons;
