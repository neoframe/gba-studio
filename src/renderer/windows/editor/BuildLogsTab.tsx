import { useCallback, useLayoutEffect } from 'react';
import { IconButton, Kbd, Text, Tooltip } from '@radix-ui/themes';
import { classNames } from '@junipero/react';
import { ArrowDownIcon, TrashIcon } from '@radix-ui/react-icons';
import { useHotkeys } from 'react-hotkeys-hook';

import { useBottomBar, useLogs } from '../../services/hooks';

const BuildLogsTab = () => {
  const { buildLogs, clearBuildLogs } = useLogs();
  const { manualScroll, scrolledToBottom, scrollToBottom } = useBottomBar();

  useLayoutEffect(() => {
    if (!manualScroll) {
      scrollToBottom();
    }
  }, [buildLogs, manualScroll, scrollToBottom]);

  const clearLogs = useCallback(() => {
    clearBuildLogs();
  }, [clearBuildLogs]);

  useHotkeys('ctrl+k', () => {
    scrollToBottom();
  }, [scrollToBottom], { useKey: true });

  useHotkeys('ctrl+l', () => {
    clearLogs();
  }, [clearLogs], { useKey: true });

  return (
    <div>
      <div
        className={classNames(
          'bg-mischka dark:bg-gondola sticky p-2 top-0 flex items-center gap-2',
          'justify-end'
        )}
      >
        <Tooltip
          content={(
            <span className="flex items-center gap-2">
              <Text>Follow logs</Text>
              <Kbd>Ctrl + K</Kbd>
            </span>
          )}
        >
          <IconButton
            size="1"
            variant="ghost"
            disabled={scrolledToBottom}
            onClick={scrollToBottom}
            className="cursor-pointer"
          >
            <ArrowDownIcon />
          </IconButton>
        </Tooltip>
        <Tooltip
          content={(
            <span className="flex items-center gap-2">
              <Text>Clear console</Text>
              <Kbd>Ctrl + L</Kbd>
            </span>
          )}
        >
          <IconButton
            size="1"
            variant="ghost"
            onClick={clearLogs}
            className="cursor-pointer"
          >
            <TrashIcon />
          </IconButton>
        </Tooltip>
      </div>
      <pre className="whitespace-pre-wrap font-mono break-words p-4 text-sm">
        { buildLogs.map((log, index) => (
          <div
            key={index}
            className={classNames(
              {
                'text-red-500 font-bold': log.type === 'error',
                'text-green-500 font-bold': log.type === 'success',
              },
            )}
          >
            { log.message }
          </div>
        )) }
      </pre>
    </div>
  );
};

export default BuildLogsTab;
