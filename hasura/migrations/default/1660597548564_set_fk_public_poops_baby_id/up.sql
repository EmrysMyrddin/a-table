alter table "public"."poops"
  add constraint "poops_baby_id_fkey"
  foreign key ("baby_id")
  references "public"."babies"
  ("id") on update restrict on delete restrict;
