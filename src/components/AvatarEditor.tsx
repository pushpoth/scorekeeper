
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Player } from "@/types";

interface AvatarEditorProps {
  player: Player;
  onUpdateAvatar: (playerId: string, avatar: Player["avatar"]) => void;
  onClose: () => void;
}

const EMOJI_OPTIONS = ["😀", "😎", "🤩", "🥳", "🙄", "😍", "🤔", "🤓", "👻", "👽", "🤖", "🐶", "🐱", "🐭", "🐰", "🦊"];

const AvatarEditor: React.FC<AvatarEditorProps> = ({ player, onUpdateAvatar, onClose }) => {
  const [avatarType, setAvatarType] = useState<"letter" | "emoji" | "image">(
    player.avatar?.type || "letter"
  );
  const [emoji, setEmoji] = useState<string>(
    player.avatar?.type === "emoji" ? player.avatar.value : "😀"
  );
  const [imageUrl, setImageUrl] = useState<string>(
    player.avatar?.type === "image" ? player.avatar.value : ""
  );

  const handleSave = () => {
    let newAvatar: Player["avatar"];
    
    if (avatarType === "letter") {
      newAvatar = { type: "letter", value: player.name.charAt(0).toUpperCase() };
    } else if (avatarType === "emoji") {
      newAvatar = { type: "emoji", value: emoji };
    } else {
      newAvatar = { type: "image", value: imageUrl };
    }
    
    onUpdateAvatar(player.id, newAvatar);
    onClose();
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-medium">Edit Avatar for {player.name}</h3>
      
      <Tabs defaultValue={avatarType} onValueChange={(value) => setAvatarType(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="letter">Letter</TabsTrigger>
          <TabsTrigger value="emoji">Emoji</TabsTrigger>
          <TabsTrigger value="image">Image</TabsTrigger>
        </TabsList>
        
        <TabsContent value="letter" className="space-y-4">
          <div className="flex justify-center py-4">
            <Avatar className="h-16 w-16 text-xl">
              <AvatarFallback className="bg-phase10-blue text-white">
                {player.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <p className="text-center text-sm text-gray-500">Uses the first letter of the player's name</p>
        </TabsContent>
        
        <TabsContent value="emoji" className="space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {EMOJI_OPTIONS.map((e) => (
              <Button
                key={e}
                variant={emoji === e ? "default" : "outline"}
                className={`h-12 text-xl ${emoji === e ? "bg-phase10-blue" : ""}`}
                onClick={() => setEmoji(e)}
              >
                {e}
              </Button>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="image" className="space-y-4">
          <Input
            type="text"
            placeholder="Enter image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          {imageUrl && (
            <div className="flex justify-center py-2">
              <Avatar className="h-16 w-16">
                <AvatarImage src={imageUrl} alt={player.name} />
                <AvatarFallback className="bg-phase10-blue text-white">
                  {player.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end space-x-2 pt-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button className="bg-phase10-blue hover:bg-phase10-darkBlue text-white" onClick={handleSave}>
          Save
        </Button>
      </div>
    </div>
  );
};

export default AvatarEditor;
