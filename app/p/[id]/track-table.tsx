'use client';

import { usePlayback } from '@/app/playback-context';
import { PlaylistWithSongs, Song } from '@/lib/db/types';
import { useEffect, useRef } from 'react';

export function TrackTable({ playlist }: { playlist: PlaylistWithSongs }) {
  let tableRef = useRef<HTMLTableElement>(null);
  let { currentTrack, playTrack, togglePlayPause, isPlaying } = usePlayback();

  useEffect(() => {
    let handleKeyDown = (e: KeyboardEvent) => {
      if (!tableRef.current) return;

      let rows = Array.from(tableRef.current.querySelectorAll('tbody tr'));
      let currentFocusedRow = document.activeElement as HTMLElement;
      let currentIndex = rows.indexOf(currentFocusedRow);

      let newIndex: number;

      switch (e.key) {
        case 'j':
        case 'ArrowDown':
          newIndex = Math.min(currentIndex + 1, rows.length - 1);
          break;
        case 'k':
        case 'ArrowUp':
          newIndex = Math.max(currentIndex - 1, 0);
          break;
        case 'Enter':
        case ' ':
          if (currentFocusedRow && currentFocusedRow.tagName === 'TR') {
            e.preventDefault();
            let track = playlist.songs[currentIndex];
            if (currentTrack?.name === track.name) {
              togglePlayPause();
            } else {
              playTrack(track);
            }
          }
          return;
        default:
          return;
      }

      e.preventDefault();
      (rows[newIndex] as HTMLElement).focus();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [playlist.songs, playTrack, togglePlayPause, currentTrack]);

  function onClickTrackRow(
    e: React.MouseEvent<HTMLTableRowElement>,
    track: Song
  ) {
    if (e.detail === 2) {
      if (currentTrack?.name === track.name) {
        togglePlayPause();
      } else {
        playTrack(track);
      }
    }
  }

  function onKeyDownTrackRow(
    e: React.KeyboardEvent<HTMLTableRowElement>,
    track: Song
  ) {
    if (e.key === ' ') {
      e.preventDefault();
      if (currentTrack?.name === track.name) {
        togglePlayPause();
      } else {
        playTrack(track);
      }
    }
  }

  return (
    <table ref={tableRef} className="w-full text-xs">
      <thead className="sticky top-0 bg-[#0A0A0A] z-10 border-b border-[#282828]">
        <tr className="text-left text-gray-400">
          <th className="py-2 pl-3 pr-2 font-medium w-10">#</th>
          <th className="py-2 px-2 font-medium">Title</th>
          <th className="py-2 px-2 font-medium hidden sm:table-cell">Artist</th>
          <th className="py-2 px-2 font-medium hidden md:table-cell">Album</th>
          <th className="py-2 px-2 font-medium">Duration</th>
        </tr>
      </thead>
      <tbody className="mt-[1px]">
        {playlist.songs.map((track: Song, index: number) => (
          <tr
            key={index}
            className={`group cursor-pointer hover:bg-[#1A1A1A] focus-within:bg-[#1A1A1A] focus-within:outline-none focus-within:ring-[0.5px] focus-within:ring-gray-400 select-none ${
              currentTrack?.name === track.name ? 'bg-[#1A1A1A]' : ''
            }`}
            tabIndex={0}
            onClick={(e) => onClickTrackRow(e, track)}
            onKeyDown={(e) => onKeyDownTrackRow(e, track)}
          >
            <td className="py-1 pl-3 pr-2 tabular-nums w-10 text-center">
              {currentTrack?.name === track.name && isPlaying ? (
                <div className="flex items-end justify-center space-x-[2px] size-[0.65rem] mx-auto">
                  <div className="w-1 bg-neutral-600 animate-now-playing-1"></div>
                  <div className="w-1 bg-neutral-600 animate-now-playing-2 [animation-delay:0.2s]"></div>
                  <div className="w-1 bg-neutral-600 animate-now-playing-3 [animation-delay:0.4s]"></div>
                </div>
              ) : (
                <span className="text-gray-400">{index + 1}</span>
              )}
            </td>
            <td className="py-1 px-2">
              <div className="flex items-center">
                <img
                  src={track.imageUrl}
                  alt={`${track.album} cover`}
                  className="size-4 mr-2 object-cover"
                />
                <div className="font-medium truncate max-w-[120px] sm:max-w-[200px] text-[#d1d5db]">
                  {track.name}
                  <span className="sm:hidden text-gray-400 ml-1">
                    • {track.artist}
                  </span>
                </div>
              </div>
            </td>
            <td className="py-1 px-2 hidden sm:table-cell text-[#d1d5db]">
              {track.artist}
            </td>
            <td className="py-1 px-2 hidden md:table-cell text-[#d1d5db]">
              {track.album}
            </td>
            <td className="py-1 px-2 tabular-nums text-[#d1d5db]">
              {track.duration}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
