import {
    // LogOut,
    Delete,
    Settings,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    // DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteAllImages } from "@/hooks/useDeleteAllImages";

export const OptionsDropDown = () => {
    const deleteAll = useDeleteAllImages();
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <Settings />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Workspace</DropdownMenuLabel>
                <DropdownMenuItem onClick={deleteAll}>
                    <Delete />
                    <span>Delete All Images</span>
                </DropdownMenuItem>
                {/* <DropdownMenuSeparator />
                <DropdownMenuLabel>User</DropdownMenuLabel>
                <DropdownMenuItem>
                    <LogOut />
                    <span>Log out</span>
                </DropdownMenuItem> */}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
