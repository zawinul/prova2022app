prova

```mermaid
flowchart TD
	classDef role fill:#80ff80,color:black,stroke:#333,stroke-width:1px;
	classDef policy fill:#ffff80,color:black,stroke:#333,stroke-width:1px;


    lambda(prova2022Lambda)
	r1(tenant_a1_writer)
	r2(tenant_a2_writer)
	rl(prova2022Lambda-role-88t3s5dv)

	pat(assume tenants)
	ple(lambda execution)
	pat1(access_tenant_a1)
	pat2(access_tenant_a2)

	class r1,r2,rl role
	class lambda lambda
	class pat,ple,pat1,pat2 policy
	lambda-->rl
	rl-->pat
	rl-->ple
	r1-->pat1
	r2-->pat2
	lambda.->r1




    PolicyTicketmachineLog
    PolicyUseDynamoCache
    PolicyAcessTenant2
    RoleLambdaWebOptions
    RoleLambdaTicketMachine
    RoleLambdaProva2022
    LambdaProva2022
    LambdaTicketMachine
    LambdaPermissionProva2022
    LambdaPermissionFree
    LambdaWebOptions
    LambdaPermissionDefault
    DynamoTableCache
    ApiGatewayV2Api
    ApiRouteProva2022Lambda
    ApiRouteDefault
    ApiRouteFreeLambda
    ApiIntegrationLambdaWebOptions
    ApiIntegrationLambdaProva2022
    ApiIntegrationWhoAmI
    ApiGatewayV2Authorizer
    IAMUserTicketMachine
    IAMPolicyAssumeTicketmachineRoles
    IamRoleTenantA1Writer
    IAMRoleAccessTenantA2
    IAMPolicyCustomTenantA1
    IAMPolicyTickMachineAssumeRole
    IAMPolictTickMachReadParameters
    SSMParameterTicketMachineUserUserKeyId

    SSMParameterTicketMachineUserSecretAccessKey




```