#include <3ds.h>
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <malloc.h>
#include "brahma.h"
#include "hid.h"
#include "menus.h"
#include "sochlp.h"

extern u8 starter_bin[], firm0_bin[], firm1_bin[], sector_bin[];
extern u32 starter_bin_size, firm0_bin_size, firm1_bin_size, sector_bin_size;

s32 main (void) {
	gfxInitDefault();
	consoleInit(GFX_BOTTOM, NULL);
	if (brahma_init()) {
		printf("Exploiting arm9...\n");
		load_arm9_payload_from_mem (starter_bin, starter_bin_size);
		printf("%08X\n", firm_reboot ());
		brahma_exit();
	} 
	gfxExit();
	return 0;
}
