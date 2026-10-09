import { stateName } from "@/lib/customer/india";
import { formatPhone } from "@/lib/customer/format";
import type { Address } from "@/lib/customer/types";

/** A postal address as people read it on an Indian parcel label. */
export function AddressBlock({ address }: { address: Address }) {
  return (
    <address className="not-italic leading-relaxed text-muted-foreground">
      <span className="text-foreground">{`${address.firstName} ${address.lastName}`.trim()}</span>
      <br />
      {address.address1}
      {address.address2 ? (
        <>
          <br />
          {address.address2}
        </>
      ) : null}
      <br />
      {address.city}, {stateName(address.zoneCode)} {address.zip}
      <br />
      {address.phoneNumber ? formatPhone(address.phoneNumber) : null}
    </address>
  );
}
