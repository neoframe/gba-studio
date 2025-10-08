import { useCallback, useEffect, useState } from 'react';
import { classNames, useEventListener } from '@junipero/react';
import { ListBulletIcon, PlayIcon } from '@radix-ui/react-icons';
import { Card, IconButton, Inset, Text } from '@radix-ui/themes';
import { type ResizableProps, Resizable } from 're-resizable';

import type { GameScene } from '../../../types';
import { useApp } from '../../services/hooks';
import Collapsible from '../../components/Collapsible';

export interface ProjectSidebarProps extends ResizableProps {
  onSelectScene: (scene: GameScene) => void;
}

const ProjectSidebar = ({
  className,
  onSelectScene,
  ...rest
}: ProjectSidebarProps) => {
  const [opened, setOpened] = useState(true);
  const [width, setWidth] = useState(300);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const { scenes, variables } = useApp();

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
                      className="block"
                      onClick={onSelectScene.bind(null, scene)}
                    >
                      { scene.name }
                    </a>
                  )) }
                </Collapsible.Content>
              </Collapsible.Root>

              <Collapsible.Root>
                <Collapsible.Trigger>
                  <Text>Variables</Text>
                </Collapsible.Trigger>
                <Collapsible.Content>
                  { variables.map(v => Object.keys(v.values)).flat().map(v => (
                    <div key={v}>{ v }</div>
                  ))}
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
