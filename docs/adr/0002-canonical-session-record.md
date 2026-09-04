# Satu Session = satu Canonical Record

`premium.events` adalah ledger mentah yang bisa mengandung warm-up, double entry, atau set yang belum difinalisasi. Kita putuskan `sessions` dengan `canonicalVersion: RC4` hasil `finishWorkout` adalah satu-satunya sumber kebenaran untuk History, weeklyMuscles, dan JEVARA IQ. Guard `FINALIZING` + `finalizedIds` mencegah duplikasi saat FINISH ditekan dua kali. Alternatif ledger-as-truth ditolak karena akan menginflasi exposure dan PR.
