alter table "public"."medications"
  add constraint "medications_baby_id_fkey"
  foreign key ("baby_id")
  references "public"."babies"
  ("id") on update restrict on delete restrict;
