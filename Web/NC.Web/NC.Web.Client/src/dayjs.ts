import dayjs from "dayjs";
import "dayjs/locale/en";
import "dayjs/locale/tr";

import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
