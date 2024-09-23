import React, { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { GameWithCategoryAndParticipants } from "@/store/game/get";
import { useUpdateUserPointsAtom } from "@/store/user/update-points";
import { useRouter } from "next/navigation";
import { NAVIGATION } from "@/utils/navigation/routes";

type LeavePagePopupParams = {
  game: GameWithCategoryAndParticipants
  winner: {
    id: string
    points: number
  }
  quitter: {
    id: string
    points: number
  }
}

export const LeavePagePopup = ({ game, winner, quitter }: LeavePagePopupParams) => {
  const [showDialog, setShowDialog] = useState(false);
  const router = useRouter();
  const [{ mutate: updateUserPoints, isPending }] = useUpdateUserPointsAtom();

  useEffect(() => {
    if (!isPending) return;

    function beforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = '';
    }

    window.addEventListener('beforeunload', beforeUnload);

    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
    };
  }, [isPending]);

  const handleLeavePage = (e: any) => {
    if (!isPending) return;
    e.preventDefault();
    setShowDialog(true);
  };

  useEffect(() => {
    window.addEventListener('popstate', handleLeavePage);
    return () => {
      window.removeEventListener('popstate', handleLeavePage);
    };
  }, [isPending]);

  const handleAccept = async () => {
    setShowDialog(false);
    await updateUserPoints({
      winner,
      quitter
    }, {
      onSettled: (results) => {
        if (results && results.status === 'fulfilled') {
          router.push(NAVIGATION.Dashboard.Games);
        }
      }
    });
  };

  const handleCancel = () => {
    setShowDialog(false);
  };

  return (
    <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>leaving?</AlertDialogTitle>
          <AlertDialogDescription>
            it will cost you -{game.points}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>cancel</AlertDialogCancel>
          <AlertDialogAction disabled={isPending} onClick={handleAccept}>{isPending ? 'redirect...' : 'leave?'}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};