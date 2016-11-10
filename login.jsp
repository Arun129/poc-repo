<!DOCTYPE html>
<%@page import="com.kpmg.dra.util.DRAEnvironmentProperties"%>
<%@page import="java.net.URLEncoder"%>
<%
String companyCode = request.getParameter("company_code");
String contextpath = request.getContextPath();
if(contextpath.startsWith("/")) {
	contextpath = contextpath.substring(1);
}
DRAEnvironmentProperties envconfig = DRAEnvironmentProperties.getInstance();
String redirectUrl=envconfig.getString(DRAEnvironmentProperties.APP_URL);
if( redirectUrl == null || redirectUrl.trim().length()<0){
	redirectUrl="https://localhost:8080/dra-web/cellocallback";
}else{
	redirectUrl=redirectUrl+"/cellocallback";    
}
String celloAuthURL = envconfig.getString(DRAEnvironmentProperties.CELLO_AUTHENTICATION_URL);
if(celloAuthURL.endsWith("/")) {
	celloAuthURL = celloAuthURL.substring(0, celloAuthURL.length()-1);
}
response.sendRedirect(celloAuthURL +
		"/authorize?response_type=code&state=STATE" +
		"&client_id=5df78e31-1dca-4dcd-832f-c28b599fff5b" + 
		((companyCode != null && companyCode.trim().length()>0) ? "&company_code="+URLEncoder.encode(companyCode, "UTF-8") : "") +
		"&scope=openid+email+profile&redirect_uri="+redirectUrl);
%>