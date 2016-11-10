<%@ page isErrorPage="true" %>
<%String s=(String)request.getAttribute("errorMessage");
if(s!=null){
    out.println("<p>"+s+"</p>");
}
if(exception!=null &&exception.getMessage()!=null){
    out.println("<p>"+exception.getMessage()+"</p>");
}
%>


<h3> ${pageContext.errorData.statusCode} error occurred </h3>