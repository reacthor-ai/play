import React, {useEffect, useState} from 'react';
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
import {GameWithCategoryAndParticipants} from "@/store/game/get";
import {useUpdateUserPointsAtom} from "@/store/user/update-points";
import {useRouter} from "next/navigation";
import {NAVIGATION} from "@/utils/navigation/routes";

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

export const LeavePagePopup = ({game, winner, quitter}: LeavePagePopupParams) => {
  const [showDialog, setShowDialog] = useState(false);
  const router = useRouter()
  const [{mutate: updateUserPoints, isPending}] = useUpdateUserPointsAtom()

  useEffect(() => {
    const handleBeforeUnload = (event: any) => {
      event.preventDefault();
      event.returnValue = '';
      setShowDialog(true);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleAccept = () => {
    setShowDialog(false);
    window.removeEventListener('beforeunload', () => {
    });
    window.location.href = (document as any).activeElement.href;
  };

  const handleCancel = async () => {
    setShowDialog(false);
    await updateUserPoints({
      winner,
      quitter
    }, {
      onSettled: (results) => {
        if (results && results.status === 'fulfilled') {
          router.push(NAVIGATION.Dashboard.Games)
        }
      }
    })
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
          <AlertDialogAction disabled={isPending} onClick={handleAccept}>leave</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

