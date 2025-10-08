import {
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { classNames, useEventListener } from '@junipero/react';
import {
  ListBulletIcon,
  PlayIcon,
  PlusCircledIcon,
  StackIcon,
} from '@radix-ui/react-icons';
import { Card, IconButton, Inset, Text } from '@radix-ui/themes';
import { type ResizableProps, Resizable } from 're-resizable';

import type { GameScene, GameVariables } from '../../../types';
import { useApp, useCanvas } from '../../services/hooks';
import Collapsible from '../../components/Collapsible';

export interface ProjectSidebarProps extends ResizableProps {
  onSelectScene: (scene: GameScene) => void;
  onVariablesChange: (registry: GameVariables) => void;
}

const ProjectSidebar = ({
  className,
  onSelectScene,
  onVariablesChange,
  ...rest
}: ProjectSidebarProps) => {
  const [opened, setOpened] = useState(true);
  const [width, setWidth] = useState(300);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const { scenes, variables } = useApp();
  const { selectedScene } = useCanvas();

  const checkFullscreen = useCallback(async () => {
    setIsFullScreen(await window.electron.isFullscreen());
  }, []);

  useEventListener('resize', () => {
    checkFullscreen();
  }, [checkFullscreen]);

  useEffect(() => {
    checkFullscreen();
  }, [checkFullscreen]);

  const toggle = () => {
    setOpened(o => !o);
  };

  const onVariableNameKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    e.stopPropagation();

    if (e.key === 'Enter') {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  const onVariableNameChange = useCallback((
    registry: GameVariables,
    oldName: string,
    e: ChangeEvent<HTMLDivElement>
  ) => {
    const name = e.currentTarget.textContent
      .trim().slice(0, 32);

    if (name === oldName) {
      return;
    }

    if (!name) {
      // Remove variable
      const { [oldName]: _, ...rest } = registry.values;
      onVariablesChange?.({
        ...registry,
        values: rest,
      });

      return;
    }

    onVariablesChange?.({
      ...registry,
      values: Object
        .fromEntries(Object.entries(registry.values).map(([k, v]) => (
          k === oldName ? [name, v] : [k, v]
        ))),
    });
  }, [onVariablesChange]);

  const onAddVariable = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (!variables.length) {
      variables.push({ _file: 'variables.json', values: {} });
    }

    const latestRegistry = variables[variables.length - 1];
    const name = 'Variable_' +
      Object.keys(latestRegistry?.values || {}).length;
    onVariablesChange?.({
      ...latestRegistry,
      values: {
        ...latestRegistry?.values,
        [name]: 0,
      },
    });

    // Focus the new variable
    setTimeout(() => {
      const varEl = document.querySelector(
        `[data-variable="${name}"] [contenteditable]`
      ) as HTMLDivElement | undefined;

      if (varEl) {
        varEl.focus();

        const range = document.createRange();
        range.selectNodeContents(varEl);

        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }, 10);
  }, [variables, onVariablesChange]);

  return (
    <>
      <div
        className={classNames(
          'fixed left-0 top-[15px] h-[32px] flex',
          'z-2000 gap-8 items-center w-full pr-4 justify-between !app-no-drag',
          'pointer-events-auto transition-[padding-left] duration-100',
          {
            'pl-[100px]': !isFullScreen,
            'pl-6': isFullScreen,
          },
        )}
        style={{ width: opened ? width : 'auto' }}
      >
        <IconButton variant="ghost" radius="full" onClick={toggle}>
          <ListBulletIcon
            width={20}
            height={20}
            className="dark:[&_path]:fill-seashell"
          />
        </IconButton>
        <div className="flex items-center gap-2">
          <IconButton variant="ghost" radius="full">
            <PlayIcon
              width={20}
              height={20}
              className="dark:[&_path]:fill-seashell"
            />
          </IconButton>
        </div>
      </div>
      <Resizable
        defaultSize={{ width: 300 }}
        onResize={(_, __, ref) => setWidth(ref.offsetWidth)}
        onResizeStart={(_, __, ref) => setWidth(ref.offsetWidth)}
        onResizeStop={(_, __, ref) => setWidth(ref.offsetWidth)}
        maxWidth="40vw"
        minWidth={200}
        { ...rest }
        className={classNames(
          'flex-none pointer-events-auto h-full relative',
          'transition-[margin-left] duration-100',
          className,
        )}
        style={{
          marginLeft: -(opened ? 0 : (width * 1)),
        }}
      >
        <div className="p-2 pr-0 w-full h-full relative">
          <Card
            className={classNames(
              'w-full h-full bg-seashell dark:bg-onyx z-10',
              'before:!rounded-[26px] after:!rounded-[26px] !rounded-[26px]',
              '!pt-14'
            )}
          >
            <Inset className="flex flex-col gap-px">
              <Collapsible.Root>
                <Collapsible.Trigger>
                  <Text>Scenes</Text>
                </Collapsible.Trigger>
                <Collapsible.Content>
                  { scenes.map(scene => (
                    <a
                      key={scene._file}
                      href="#"
                      className={classNames(
                        'flex items-center gap-2 px-3 py-1',
                        { 'bg-(--accent-9)': selectedScene === scene },
                      )}
                      onClick={onSelectScene.bind(null, scene)}
                    >
                      <StackIcon
                        className={classNames(
                          '[&_path]:fill-(--accent-9)',
                          { '[&_path]:fill-seashell': selectedScene === scene },
                        )}
                      />
                      <Text>{ scene.name }</Text>
                    </a>
                  )) }
                </Collapsible.Content>
              </Collapsible.Root>

              <Collapsible.Root>
                <Collapsible.Trigger>
                  <div className="flex items-center justify-between w-full">
                    <Text>Variables</Text>
                    <IconButton
                      variant="ghost"
                      radius="full"
                      onClick={onAddVariable}
                    >
                      <PlusCircledIcon
                        width={16}
                        height={16}
                      />
                    </IconButton>
                  </div>
                </Collapsible.Trigger>
                <Collapsible.Content>
                  { variables.map(registry => (
                    Object.keys(registry?.values || {}).map(v => (
                      <div
                        key={v}
                        className="px-3 flex items-center gap-2 py-1"
                        data-variable={v}
                      >
                        <Text className="text-(--accent-9) cursor-default">
                          $
                        </Text>
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          className={classNames(
                            'whitespace-nowrap flex-auto overflow-scroll',
                            'outline-(--accent-9) rounded-xs focus:outline-2',
                          )}
                          onKeyDown={onVariableNameKeyDown}
                          onBlur={onVariableNameChange.bind(null, registry, v)}
                        >
                          { v }
                        </div>
                      </div>
                    ))
                  )) }
                </Collapsible.Content>
              </Collapsible.Root>
            </Inset>
          </Card>
        </div>
      </Resizable>
    </>
  );
};

export default ProjectSidebar;
