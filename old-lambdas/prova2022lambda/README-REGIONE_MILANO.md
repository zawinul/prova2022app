> AWS recommends using regional AWS Security Token Service (STS) endpoints to reduce latency. Session tokens from regional STS endpoints are valid in all AWS Regions. If you use regional STS endpoints, no action is required.
>
> **Session tokens from the global STS endpoint (https://sts.amazonaws.com) are valid only in AWS Regions that are enabled by default**. 
>
> If you intend to enable a new Region for your account, you can either use session tokens from regional STS endpoints or activate the global STS endpoint to issue session tokens that are valid in all AWS Regions. You can do this in Account Settings in the IAM console.
>
> Session tokens that are valid in all AWS Regions are larger. If you store session tokens, these larger tokens might affect your systems.

see https://stackoverflow.com/questions/56542248/the-provided-token-is-malformed-or-otherwise-invalid/71171553#71171553