
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface EmojiPickerProps {
  selectedEmoji?: string;
  onEmojiSelect: (emoji: string) => void;
  className?: string;
}

const EMOJI_CATEGORIES = {
  'Work & Office': ['💼', '📊', '📈', '💻', '📝', '📞', '📧', '🖥️', '📋', '📁'],
  'Health & Fitness': ['💪', '🏃‍♂️', '🧘‍♀️', '💊', '🏥', '🩺', '🍎', '🥗', '🏋️‍♂️', '🚴‍♂️', '🏊‍♂️'],
  'Home & Chores': ['🧹', '🛏️', '🍳', '🧺', '🚿', '🛒', '🏠', '🔧', '🪴', '🧽'],
  'Education': ['📚', '📖', '✏️', '🎓', '📐', '🔬', '🧮', '📓', '🖊️', '📄'],
  'Entertainment': ['🎬', '🎮', '🎵', '📺', '🎨', '📷', '🎪', '🎭', '🎯', '🎲'],
  'Travel & Transport': ['✈️', '🚗', '🚌', '🚇', '🏖️', '🗺️', '🧳', '🎒', '⛽', '🚁'],
  'Food & Cooking': ['🍕', '🍔', '🥘', '🍝', '🥪', '🍜', '🥙', '🍱', '🥗', '🍲'],
  'People & Family': ['👶', '👨‍👩‍👧‍👦', '👴', '👵', '🤝', '💑', '👫', '👬', '👭', '🎂'],
  'Animals': ['🐕', '🐱', '🐠', '🐦', '🐰', '🐭', '🐹', '🐨', '🦊', '🐸'],
  'Nature': ['🌱', '🌸', '🌳', '🌞', '🌙', '⭐', '🌈', '🔥', '💧', '🌊'],
  'Objects': ['⏰', '📱', '🔑', '💡', '🎁', '🎈', '🏆', '🎯', '🔔', '⚡'],
  'Symbols': ['✅', '❌', '⭐', '💎', '🔥', '💯', '❤️', '💚', '💙', '💜']
};

export const EmojiPicker = ({ selectedEmoji, onEmojiSelect, className }: EmojiPickerProps) => {
  const [open, setOpen] = useState(false);

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`text-xl p-1 h-auto ${className || ''}`}
          aria-label={selectedEmoji ? `Change emoji, currently ${selectedEmoji}` : "Choose an emoji"}
          title={selectedEmoji ? `Change emoji, currently ${selectedEmoji}` : "Choose an emoji"}
        >
          {selectedEmoji || '😀'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="max-h-80 overflow-y-auto">
          <div className="p-2 border-b">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEmojiClick('')}
              className="text-sm"
              aria-label="No emoji"
            >
              No emoji
            </Button>
          </div>
          {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
            <div key={category} className="p-2">
              <div className="text-xs font-medium text-gray-500 mb-2">{category}</div>
              <div className="grid grid-cols-10 gap-1">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleEmojiClick(emoji)}
                    className="text-lg hover:bg-gray-100 rounded p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    aria-label={`Select ${emoji} emoji`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
